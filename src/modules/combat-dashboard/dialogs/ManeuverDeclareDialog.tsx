import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Box, Button, ButtonBase, Chip, Stack, Typography } from '@mui/material';
import {
  ChipRow,
  EmptyState,
  fetchFullPage,
  fetchSkillCategories,
  fetchSkills,
  formatBonus,
  normalizeText,
  RmuDialog,
  SearchField,
  selectableSx,
  Skill,
  SkillCategory,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useQuery } from '@tanstack/react-query';
import { fetchActions } from '../../api/action';
import { Action } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';
import { useCombatGame, useCombatRound } from '../../combat/combat-context';
import { ActorSkill, useSkillService } from '../../hooks/useSkillService';
import OptionChips from '../flows/maneuver/OptionChips';
import ManeuverSpecializationPicker from './ManeuverSpecializationPicker';
import { bestBonus, developedSpecializations, entriesOf, isCombatSkill, needsSpecialization } from './combat-skills';
import { useSpecializationCatalog } from './useSpecializationCatalog';

const ALL = 'all';
const COMBAT = 'combat';
const DEVELOPED = 'developed';
/** Bonus of a character without the skill; what an NPC's stat block does not list counts 0 (spec 055). */
const UNSKILLED_BONUS = -25;
const NO_CATEGORIES: SkillCategory[] = [];
const NO_SKILLS: Skill[] = [];
const NO_ACTIONS: Action[] = [];

type ManeuverDeclaration = { skillId: string; specialization?: string; continuesActionId?: string };

/**
 * Percent maneuvers of an actor that can go on in a new action (spec 010 §4.4): resolved, not completed and not
 * continued yet by another action.
 */
const unfinishedPercentManeuvers = (actions: Action[], actorId: string): Action[] => {
  const continued = new Set(actions.map((a) => a.maneuver?.continuesActionId).filter(Boolean));
  return actions
    .filter(
      (a) =>
        a.actorId === actorId &&
        a.status === 'completed' &&
        a.maneuver?.modifiers.maneuverType === 'percent' &&
        a.maneuver.result &&
        !a.maneuver.result.completed &&
        !continued.has(a.id)
    )
    .sort((a, b) => b.round - a.round || b.phaseStart - a.phaseStart);
};

/**
 * Declaration of a maneuver (spec 093): its skill, searched by name or browsed by category, with the actor's bonus in
 * each one, and its specialization when it needs one. By default it offers the skills of a combat the actor has
 * developed. The list scrolls inside the dialog, so the specialization and "Declare" always stay in view. The type of
 * the maneuver is the skill's default, and can be changed when it is resolved.
 */
const ManeuverDeclareDialog: FC<{
  open: boolean;
  actorRound: ActorRound | null;
  /** Skill already chosen (perception, medical). */
  initialSkillId?: string | null;
  busy?: boolean;
  onClose: () => void;
  onDeclare: (maneuver: ManeuverDeclaration) => void;
}> = ({ open, actorRound, initialSkillId, busy, onClose, onDeclare }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const { getActorSkills } = useSkillService();
  const { strategicGame } = useCombatGame();
  const { roundActions } = useCombatRound();
  // Static catalogs: once loaded they are not read again each time the dialog opens.
  const categoriesQuery = useQuery<SkillCategory[], Error>({
    queryKey: ['skill-catalog', 'categories'],
    queryFn: () =>
      fetchFullPage((rsql, page, size) => fetchSkillCategories(rsql, page, size, auth), '').then(
        (data) => data.content
      ),
    enabled: open,
    staleTime: Infinity,
  });
  const categories = categoriesQuery.data ?? NO_CATEGORIES;
  const skillsQuery = useQuery<Skill[], Error>({
    queryKey: ['skill-catalog', 'skills'],
    queryFn: () => fetchSkills('', 0, 1000, auth).then((data) => data.content),
    enabled: open,
    staleTime: Infinity,
  });
  const skills = skillsQuery.data ?? NO_SKILLS;
  const [category, setCategory] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [combatOnly, setCombatOnly] = useState(true);
  const [onlyDeveloped, setOnlyDeveloped] = useState(true);
  const [skillId, setSkillId] = useState<string | null>(null);
  const [specialization, setSpecialization] = useState<string | null>(null);
  const [continuesActionId, setContinuesActionId] = useState<string | null>(null);

  useEffect(() => {
    if (categoriesQuery.error) notify.error(categoriesQuery.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesQuery.error]);
  useEffect(() => {
    if (skillsQuery.error) notify.error(skillsQuery.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillsQuery.error]);

  // Every time it opens, start from the given skill (or none).
  useEffect(() => {
    if (!open) return;
    setSkillId(initialSkillId ?? null);
    setSpecialization(null);
    setContinuesActionId(null);
    setFilter('');
    setCategory(null);
  }, [open, initialSkillId]);

  // The actor's maneuvers of every round, to offer continuing an unfinished percent one.
  const actorActionsQuery = useQuery<Action[], Error>({
    queryKey: ['maneuver-declare', 'actor-actions', actorRound?.gameId, actorRound?.actorId, actorRound?.id],
    queryFn: () =>
      fetchActions(`gameId==${actorRound?.gameId};actorId==${actorRound?.actorId}`, 0, 200, auth).then(
        (page) => page.content ?? []
      ),
    enabled: open && !!actorRound,
    gcTime: 0,
  });
  // Read again each time it opens: what the previous opening loaded is not offered meanwhile.
  const actorActions =
    actorActionsQuery.isFetching || actorActionsQuery.isError ? NO_ACTIONS : (actorActionsQuery.data ?? NO_ACTIONS);

  const unfinished = useMemo(() => {
    if (!actorRound) return [];
    const byId = new Map<string, Action>();
    [...actorActions, ...(roundActions ?? [])].forEach((a) => byId.set(a.id, a));
    return unfinishedPercentManeuvers([...byId.values()], actorRound.actorId);
  }, [actorActions, roundActions, actorRound]);

  // The sheet changes when the combat reloads: what matters is the actor.
  const actorSkills: ActorSkill[] = useMemo(
    () => (actorRound ? getActorSkills(actorRound) : []),
    [actorRound] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const isNpc = !!actorRound?.npcId;
  const selectedSkill = skills.find((each) => each.id === skillId) ?? null;
  const selectedEntries = entriesOf(actorSkills, skillId ?? '');
  const developedOfSelected = useMemo(() => developedSpecializations(selectedEntries), [actorSkills, skillId]); // eslint-disable-line react-hooks/exhaustive-deps
  const catalog = useSpecializationCatalog(
    selectedSkill?.specialization ? selectedSkill : null,
    strategicGame?.realmId
  );
  useEffect(() => {
    if (catalog.error) notify.error(catalog.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog.error]);
  const continued = unfinished.find((a) => a.id === continuesActionId);

  /** The specialization a skill starts with: the only one the actor has developed. */
  const initialSpecialization = (skill: Skill): string | null => {
    const developedOnes = developedSpecializations(entriesOf(actorSkills, skill.id));
    return skill.specialization && developedOnes.length === 1 ? developedOnes[0].specialization : null;
  };

  const chooseSkill = (skill: Skill) => {
    setSkillId(skill.id);
    setSpecialization(initialSpecialization(skill));
    if (continued && continued.maneuver?.modifiers.skillId !== skill.id) setContinuesActionId(null);
  };

  const chooseContinuation = (action: Action) => {
    if (continuesActionId === action.id) {
      setContinuesActionId(null);
      return;
    }
    setContinuesActionId(action.id);
    setSkillId(action.maneuver?.modifiers.skillId ?? null);
    setSpecialization(null);
  };

  // A continuation keeps the skill and the specialization of the maneuver it continues, and is a percent one.
  const declaration = (id: string, chosen: string | null): ManeuverDeclaration =>
    continued?.maneuver?.modifiers.skillId === id
      ? { skillId: id, continuesActionId: continued.id }
      : { skillId: id, ...(chosen ? { specialization: chosen } : {}) };

  const continuing = !!selectedSkill && continued?.maneuver?.modifiers.skillId === selectedSkill.id;
  const missingSpecialization =
    !!selectedSkill &&
    !continuing &&
    !specialization &&
    needsSpecialization(selectedSkill, selectedEntries) &&
    (catalog.loading || catalog.keys.length > 0 || developedOfSelected.length > 0);

  /** A double click declares at once, unless the specialization is still to be chosen. */
  const declareAtOnce = (skill: Skill) => {
    const chosen = initialSpecialization(skill);
    const pending =
      needsSpecialization(skill, entriesOf(actorSkills, skill.id)) &&
      !chosen &&
      continued?.maneuver?.modifiers.skillId !== skill.id;
    if (!busy && !pending) onDeclare(declaration(skill.id, chosen));
  };

  const developed = useMemo(() => skills.filter((s) => entriesOf(actorSkills, s.id).length > 0), [skills, actorSkills]);
  // Without developed skills (data not loaded, or a stat block that lists none) the filter would leave nothing.
  const developedFilter = onlyDeveloped && developed.length > 0;

  // Everything but the category: what it can still choose from.
  const matching = useMemo(() => {
    const term = normalizeText(filter.trim());
    return (developedFilter ? developed : skills)
      .filter((s) => !combatOnly || isCombatSkill(s) || s.id === initialSkillId)
      .filter((s) => !term || normalizeText(t(s.id)).includes(term));
  }, [skills, developed, developedFilter, combatOnly, initialSkillId, filter, t]);
  const availableCategories = useMemo(
    () => categories.filter((cat) => matching.some((s) => s.categoryId === cat.id)),
    [categories, matching]
  );
  // A category the other filters left empty no longer applies.
  const activeCategory = availableCategories.some((cat) => cat.id === category) ? category : null;
  const visible = useMemo(
    () =>
      matching
        .filter((s) => !activeCategory || s.categoryId === activeCategory)
        .sort((a, b) => t(a.id).localeCompare(t(b.id))),
    [matching, activeCategory, t]
  );
  const showSpecialization = !!selectedSkill?.specialization && !continuing;

  return (
    <RmuDialog
      open={open}
      onDismiss={onClose}
      maxWidth="md"
      title={t('maneuver')}
      subtitle={actorRound?.actorName}
      paperSx={{ height: { md: 'min(80vh, 760px)' } }}
      buttons={
        <>
          <Button onClick={onClose}>{t('cancel')}</Button>
          <Button
            variant="contained"
            disabled={!skillId || missingSpecialization || busy}
            onClick={() => skillId && onDeclare(declaration(skillId, specialization))}
          >
            {t('declare')}
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <SearchField
          autoFocus
          size="small"
          label={t('skill')}
          placeholder={t('search')}
          value={filter}
          onChange={setFilter}
          delay={0}
        />

        {unfinished.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 0.5 }}>
              {t('continue-maneuver')}
            </Typography>
            <Box role="radiogroup" aria-label={t('continue-maneuver')}>
              <ChipRow>
                {unfinished.map((action) => {
                  const selected = action.id === continuesActionId;
                  const id = action.maneuver?.modifiers.skillId ?? '';
                  return (
                    <Chip
                      key={action.id}
                      role="radio"
                      aria-checked={selected}
                      color={selected ? 'primary' : 'default'}
                      variant={selected ? 'filled' : 'outlined'}
                      label={[
                        t(id, { defaultValue: id }),
                        `${action.maneuver?.progress ?? action.maneuver?.result?.percent ?? 0}%`,
                        t('round-n', { round: action.round }),
                      ].join(' · ')}
                      onClick={() => chooseContinuation(action)}
                    />
                  );
                })}
              </ChipRow>
            </Box>
          </Box>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          <OptionChips
            label={t('declare-scope')}
            options={[COMBAT, ALL].map((key) => ({ key, value: null }))}
            value={combatOnly ? COMBAT : ALL}
            onChange={(key) => setCombatOnly(key === COMBAT)}
            optionLabel={(option) => t(`declare-scope-${option.key}`)}
          />
          {developed.length > 0 && (
            <OptionChips
              label={t('declare-development')}
              options={[DEVELOPED, ALL].map((key) => ({ key, value: null }))}
              value={onlyDeveloped ? DEVELOPED : ALL}
              onChange={(key) => setOnlyDeveloped(key === DEVELOPED)}
              optionLabel={(option) => t(`declare-development-${option.key}`)}
            />
          )}
        </Stack>

        <OptionChips
          label={t('category')}
          options={[{ key: ALL, value: null }, ...availableCategories.map((cat) => ({ key: cat.id, value: null }))]}
          value={activeCategory ?? ALL}
          onChange={(key) => setCategory(key === ALL || key === activeCategory ? null : key)}
          optionLabel={(option) => (option.key === ALL ? t('declare-category-all') : t(option.key))}
        />

        <Box
          role="radiogroup"
          aria-label={t('skill')}
          sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 1 }}
        >
          {visible.map((skill) => {
            const selected = skill.id === skillId;
            const value = bestBonus(entriesOf(actorSkills, skill.id));
            return (
              <ButtonBase
                key={skill.id}
                role="radio"
                aria-checked={selected}
                onClick={() => chooseSkill(skill)}
                onDoubleClick={() => declareAtOnce(skill)}
                sx={[
                  selectableSx(selected),
                  { justifyContent: 'space-between', gap: 1, px: 1.5, py: 1, minHeight: 44, textAlign: 'left' },
                ]}
              >
                <Typography variant="body2" sx={{ fontWeight: selected ? 600 : 500 }}>
                  {t(skill.id)}
                </Typography>
                <Typography
                  variant="body2"
                  color={value === undefined ? 'text.disabled' : 'text.secondary'}
                  sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
                >
                  {value === undefined ? '—' : formatBonus(value)}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>
        {skills.length > 0 && visible.length === 0 && (
          <EmptyState dense title={combatOnly ? t('declare-scope-empty') : undefined} />
        )}

        {showSpecialization && selectedSkill && (
          <Box
            sx={{
              position: 'sticky',
              bottom: 0,
              zIndex: 1,
              pt: 1.5,
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <ManeuverSpecializationPicker
              key={selectedSkill.id}
              skillName={t(selectedSkill.id)}
              developed={developedOfSelected}
              catalog={catalog}
              undevelopedBonus={isNpc ? 0 : UNSKILLED_BONUS}
              value={specialization}
              onChange={setSpecialization}
            />
          </Box>
        )}
      </Stack>
    </RmuDialog>
  );
};

export default ManeuverDeclareDialog;
