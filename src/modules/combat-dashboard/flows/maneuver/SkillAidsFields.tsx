import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Button, Chip, Collapse, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';
import {
  ChipRow,
  formatBonus,
  MAX_COMPLEMENTARY_HELPERS,
  RuleHint,
  SIMILARITY_VALUES,
  SimilarityValue,
  SKILL_RELATION_PENALTIES,
  SKILL_RELATIONS,
  SkillRelation,
  SkillSelector,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import type { TFunction } from 'i18next';
import { ManeuverModifiersListing } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import OptionChips from './OptionChips';
import { ManeuverForm } from './maneuver-form';

const skillLabel = (t: TFunction, skillId: string, specialization?: string | null) =>
  `${t(skillId, { defaultValue: skillId })}${specialization ? ` (${t(specialization, { defaultValue: specialization })})` : ''}`;

/**
 * Similar and complementary skills (workspace spec 079, B1; Core Law ch. 3): a collapsible block of the modifiers step.
 * The similar skill is the one the maneuver needs (the actor rolls a similar one: its relation and similarity are
 * penalties); each helper is an actor of the game with a skill whose ranks help, halved from the second one on. The
 * lines the API computes come back in the listing (`aids`).
 */
const SkillAidsFields: FC<{
  listing: ManeuverModifiersListing;
  form: ManeuverForm;
  onChange: (change: Partial<ManeuverForm>) => void;
  /** Actors of the round: the one who rolls and the others who can help. */
  actors: ActorRound[];
  actorRound?: ActorRound;
}> = ({ listing, form, onChange, actors, actorRound }) => {
  const { t } = useTranslation();
  const notify = useApiNotify();
  const used = !!form.similarity || form.complementary.length > 0;
  const [open, setOpen] = useState(used);
  // SkillSelector keeps its own state: a new key starts it empty again
  const [selectorKey, setSelectorKey] = useState(0);
  const similarity = form.similarity;
  const aids = listing.aids ?? [];

  const setSimilarity = (patch: Partial<NonNullable<ManeuverForm['similarity']>> | null) =>
    onChange({
      similarity: patch === null ? null : { targetSkillId: '', similarity: -25, ...similarity, ...patch },
    });
  const addHelper = () =>
    onChange({ complementary: [...form.complementary, { actorId: actorRound?.actorId, skillId: '' }] });
  const setHelper = (index: number, patch: Partial<ManeuverForm['complementary'][number]>) =>
    onChange({ complementary: form.complementary.map((each, i) => (i === index ? { ...each, ...patch } : each)) });
  const removeHelper = (index: number) => onChange({ complementary: form.complementary.filter((_, i) => i !== index) });

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, px: 1.5, py: 1 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="subtitle2">{t('skill-aids')}</Typography>
          {aids.length > 0 && (
            <Chip
              size="small"
              variant="outlined"
              label={formatBonus(aids.reduce((sum, each) => sum + each.value, 0))}
            />
          )}
        </Stack>
        <IconButton size="small" onClick={() => setOpen(!open)} aria-label={t(open ? 'collapse' : 'expand')}>
          {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Stack>
      <Collapse in={open}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <RuleHint title={t('similar-skill')} description={t('similar-skill-help')} reference="Table 3-0c">
            <Typography variant="caption" color="text.secondary">
              {t('similar-skill-help')}
            </Typography>
          </RuleHint>
          {similarity ? (
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="body2">
                  {t('similar-skill-target', {
                    skill: similarity.targetSkillId
                      ? skillLabel(t, similarity.targetSkillId, similarity.targetSpecialization)
                      : '-',
                  })}
                </Typography>
                <Button size="small" onClick={() => setSimilarity(null)}>
                  {t('remove')}
                </Button>
              </Stack>
              <SkillSelector
                key={`similar-${selectorKey}`}
                onSkillChange={(skillId) => setSimilarity({ targetSkillId: skillId ?? '', targetSpecialization: null })}
                onSpecializationChange={(specialization) => setSimilarity({ targetSpecialization: specialization })}
                onError={(message) => notify.error(message)}
              />
              <OptionChips
                options={SIMILARITY_VALUES.map((value) => ({ key: String(value), value }))}
                value={String(similarity.similarity)}
                onChange={(key) => setSimilarity({ similarity: Number(key) as SimilarityValue })}
                optionLabel={(option) => t(`similarity-${-Number(option.key)}`)}
              />
              <TextField
                select
                label={t('similar-skill-relation-label')}
                value={similarity.relation ?? ''}
                onChange={(event) =>
                  setSimilarity({ relation: (event.target.value || undefined) as SkillRelation | undefined })
                }
                helperText={t('similar-skill-relation-help')}
                sx={{ maxWidth: 320 }}
              >
                <MenuItem value="">{t('similar-skill-relation-auto')}</MenuItem>
                {SKILL_RELATIONS.map((relation) => (
                  <MenuItem key={relation} value={relation}>
                    {`${t(`skill-relation-${relation}`)} ${formatBonus(SKILL_RELATION_PENALTIES[relation])}`}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          ) : (
            <Box>
              <Button
                size="small"
                onClick={() => {
                  setSelectorKey(selectorKey + 1);
                  setSimilarity({});
                }}
              >
                {t('similar-skill-add')}
              </Button>
            </Box>
          )}

          <RuleHint
            title={t('complementary-skill')}
            description={t('complementary-skill-help')}
            reference="Ch. 3, Complementary Skills"
          >
            <Typography variant="caption" color="text.secondary">
              {t('complementary-skill-help')}
            </Typography>
          </RuleHint>
          {form.complementary.map((helper, index) => (
            <Stack key={index} direction="row" sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              <TextField
                select
                label={t('complementary-helper')}
                value={helper.actorId ?? ''}
                onChange={(event) => setHelper(index, { actorId: event.target.value || undefined })}
                sx={{ width: 200 }}
              >
                {actors.map((actor) => (
                  <MenuItem key={actor.actorId} value={actor.actorId}>
                    {actor.actorName}
                  </MenuItem>
                ))}
              </TextField>
              <Box sx={{ flex: 1, minWidth: 220 }}>
                {helper.skillId ? (
                  <Typography variant="body2">{skillLabel(t, helper.skillId, helper.specialization)}</Typography>
                ) : (
                  <SkillSelector
                    onSkillChange={(skillId) => setHelper(index, { skillId: skillId ?? '', specialization: null })}
                    onSpecializationChange={(specialization) => setHelper(index, { specialization })}
                    onError={(message) => notify.error(message)}
                  />
                )}
              </Box>
              <IconButton size="small" onClick={() => removeHelper(index)} aria-label={t('remove')}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          ))}
          {form.complementary.length < MAX_COMPLEMENTARY_HELPERS && (
            <Box>
              <Button size="small" onClick={addHelper}>
                {t('complementary-skill-add')}
              </Button>
            </Box>
          )}

          {aids.length > 0 && (
            <ChipRow>
              {aids.map((aid, index) => (
                <Chip
                  key={`${aid.key}-${index}`}
                  size="small"
                  variant="outlined"
                  color={aid.value < 0 ? 'error' : aid.value > 0 ? 'success' : 'default'}
                  label={`${t(aid.key)}${aid.params?.actor ? ` · ${String(aid.params.actor)}` : ''} ${formatBonus(aid.value)}`}
                />
              ))}
            </ChipRow>
          )}
        </Stack>
      </Collapse>
    </Box>
  );
};

export default SkillAidsFields;
