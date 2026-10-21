import React, { FC, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import SearchIcon from '@mui/icons-material/Search';
import {
  alpha,
  Box,
  Button,
  ButtonBase,
  Chip,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  fetchSkillCategories,
  fetchSkills,
  formatBonus,
  ManeuverType,
  RmuDialog,
  Skill,
  SkillCategory,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { fetchActions } from '../../api/action';
import { Action } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';
import { useTacticalNotify } from '../../services/notify-service';
import { useSkillService } from '../../services/skill-service';

const MANEUVER_TYPES: ManeuverType[] = ['absolute', 'percent'];

export type ManeuverDeclaration = { skillId: string; maneuverType: ManeuverType; continuesActionId?: string };

/**
 * Percent maneuvers of an actor that can go on in a new action (spec 010 §4.4): resolved, not completed and not
 * continued yet by another action.
 */
export const unfinishedPercentManeuvers = (actions: Action[], actorId: string): Action[] => {
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
 * Declaration of a maneuver: its type and its skill, searched by name or browsed by category, with the
 * actor's bonus in each skill. The list scrolls inside the dialog, so "Declare" always stays in view.
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
  const notify = useTacticalNotify();
  const { getSkillBonus } = useSkillService();
  const { roundActions } = useContext(CombatContext)!;
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [onlyDeveloped, setOnlyDeveloped] = useState(true);
  const [skillId, setSkillId] = useState<string | null>(null);
  const [maneuverType, setManeuverType] = useState<ManeuverType>('absolute');
  // The type was chosen by hand: choosing a skill no longer proposes its profile's type.
  const [typeChosen, setTypeChosen] = useState(false);
  const [actorActions, setActorActions] = useState<Action[]>([]);
  const [continuesActionId, setContinuesActionId] = useState<string | null>(null);

  useEffect(() => {
    if (!open || skills.length > 0) return;
    fetchSkillCategories('', 0, 100, auth)
      .then((data) => setCategories(data.content))
      .catch((err) => notify.error(err));
    fetchSkills('', 0, 1000, auth)
      .then((data) => setSkills(data.content))
      .catch((err) => notify.error(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Every time it opens, start from the given skill (or none) and an absolute maneuver.
  useEffect(() => {
    if (!open) return;
    setSkillId(initialSkillId ?? null);
    setManeuverType('absolute');
    setTypeChosen(false);
    setContinuesActionId(null);
    setFilter('');
    setCategory(null);
  }, [open, initialSkillId]);

  // The actor's maneuvers of every round, to offer continuing an unfinished percent one.
  useEffect(() => {
    if (!open || !actorRound) return;
    setActorActions([]);
    fetchActions(`gameId==${actorRound.gameId};actorId==${actorRound.actorId}`, 0, 200, auth)
      .then((page) => setActorActions(page.content ?? []))
      .catch(() => setActorActions([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, actorRound?.id]);

  const unfinished = useMemo(() => {
    if (!actorRound) return [];
    const byId = new Map<string, Action>();
    [...actorActions, ...(roundActions ?? [])].forEach((a) => byId.set(a.id, a));
    return unfinishedPercentManeuvers([...byId.values()], actorRound.actorId);
  }, [actorActions, roundActions, actorRound]);

  const chooseSkill = (id: string) => {
    setSkillId(id);
    const continued = unfinished.find((a) => a.id === continuesActionId);
    if (continued && continued.maneuver?.modifiers.skillId !== id) setContinuesActionId(null);
    const defaultType = skills.find((s) => s.id === id)?.maneuver?.defaultType;
    if (!typeChosen && !continued && defaultType) setManeuverType(defaultType);
  };

  const chooseContinuation = (action: Action) => {
    if (continuesActionId === action.id) {
      setContinuesActionId(null);
      return;
    }
    setContinuesActionId(action.id);
    setSkillId(action.maneuver?.modifiers.skillId ?? null);
    setManeuverType('percent');
  };

  // A continuation keeps the skill of the maneuver it continues.
  const declaration = (id: string): ManeuverDeclaration => {
    const continued = unfinished.find((a) => a.id === continuesActionId);
    return continued && maneuverType === 'percent' && continued.maneuver?.modifiers.skillId === id
      ? { skillId: id, maneuverType, continuesActionId: continued.id }
      : { skillId: id, maneuverType };
  };

  const bonus = (id: string) => (actorRound ? getSkillBonus(id, actorRound) : undefined);
  const developed = useMemo(() => skills.filter((s) => bonus(s.id) !== undefined), [skills, actorRound]); // eslint-disable-line react-hooks/exhaustive-deps
  // Without developed skills (an NPC, or data not loaded) the filter would leave nothing.
  const developedFilter = onlyDeveloped && developed.length > 0;

  const visible = useMemo(() => {
    const term = filter.trim().toLowerCase();
    return (developedFilter ? developed : skills)
      .filter((s) => !category || s.categoryId === category)
      .filter((s) => !term || t(s.id).toLowerCase().includes(term))
      .sort((a, b) => t(a.id).localeCompare(t(b.id)));
  }, [skills, developed, developedFilter, category, filter, t]);

  return (
    <RmuDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      title={t('maneuver')}
      subtitle={actorRound?.actorName}
      paperSx={{ height: { md: 'min(80vh, 760px)' } }}
      buttons={
        <>
          <Button onClick={onClose}>{t('cancel')}</Button>
          <Button
            variant="contained"
            disabled={!skillId || busy}
            onClick={() => skillId && onDeclare(declaration(skillId))}
          >
            {t('declare')}
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
          <Box>
            <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 0.5 }}>
              {t('maneuver-type')}
            </Typography>
            <ToggleButtonGroup
              color="primary"
              size="small"
              exclusive
              value={maneuverType}
              onChange={(_, value: ManeuverType | null) => {
                if (!value) return;
                setManeuverType(value);
                setTypeChosen(true);
                if (value !== 'percent') setContinuesActionId(null);
              }}
            >
              {MANEUVER_TYPES.map((type) => (
                <ToggleButton key={type} value={type} sx={{ minWidth: 100 }}>
                  {t(type)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label={t('skill')}
            placeholder={t('search')}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Stack>

        {unfinished.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 0.5 }}>
              {t('continue-maneuver')}
            </Typography>
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }} role="radiogroup" aria-label={t('continue-maneuver')}>
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
            </Stack>
          </Box>
        )}

        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
          {developed.length > 0 && (
            <Chip
              label={t('only-developed')}
              color={onlyDeveloped ? 'primary' : 'default'}
              variant={onlyDeveloped ? 'filled' : 'outlined'}
              aria-pressed={onlyDeveloped}
              onClick={() => setOnlyDeveloped(!onlyDeveloped)}
            />
          )}
          <Chip
            label={t('all')}
            variant={category === null ? 'filled' : 'outlined'}
            aria-pressed={category === null}
            onClick={() => setCategory(null)}
          />
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              label={t(cat.id)}
              variant={category === cat.id ? 'filled' : 'outlined'}
              aria-pressed={category === cat.id}
              onClick={() => setCategory(category === cat.id ? null : cat.id)}
            />
          ))}
        </Stack>

        <Box
          role="radiogroup"
          aria-label={t('skill')}
          sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 1 }}
        >
          {visible.map((skill) => {
            const selected = skill.id === skillId;
            const value = bonus(skill.id);
            return (
              <ButtonBase
                key={skill.id}
                role="radio"
                aria-checked={selected}
                onClick={() => chooseSkill(skill.id)}
                onDoubleClick={() => !busy && onDeclare(declaration(skill.id))}
                sx={(theme) => ({
                  justifyContent: 'space-between',
                  gap: 1,
                  px: 1.5,
                  py: 1,
                  minHeight: 44,
                  borderRadius: 1,
                  textAlign: 'left',
                  border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
                  bgcolor: selected ? alpha(theme.palette.primary.main, 0.16) : 'transparent',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, selected ? 0.22 : 0.06) },
                })}
              >
                <Typography variant="body2" sx={{ fontWeight: selected ? 700 : 500 }}>
                  {t(skill.id)}
                </Typography>
                <Typography
                  variant="body2"
                  color={value === undefined ? 'text.disabled' : 'text.secondary'}
                  sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
                >
                  {value === undefined ? '—' : formatBonus(value)}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>
        {skills.length > 0 && visible.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            {t('no-results')}
          </Typography>
        )}
      </Stack>
    </RmuDialog>
  );
};

export default ManeuverDeclareDialog;
