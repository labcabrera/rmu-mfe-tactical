import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Box,
  Chip,
  FormControlLabel,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  ChipRow,
  DifficultyPicker,
  formatBonus,
  GRAPPLE_FEATS,
  GrappleFeat,
  NumberPadField,
  SectionLabel,
  SkillDifficultyGuide,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActionMovement, MOVEMENT_LIGHT_OPTIONS } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import OptionTiles from '../attack/modifiers/pickers/OptionTiles';
import { rememberLight } from '../maneuver/maneuver-form';

const MOVEMENT_SKILLS = ['running', 'swimming', 'climbing', 'flying'];

type Modifiers = ActionMovement['modifiers'];

/** The limits of the actor, the skill, the feat a grappled actor needs and whether the movement needs a maneuver. */
export const MovementSetup: FC<{
  actorRound: ActorRound;
  modifiers: Modifiers;
  grappleFeatNeeded: boolean;
  skillBonus: (skillId: string) => number | undefined;
  onChange: (change: Partial<Modifiers>) => void;
}> = ({ actorRound, modifiers, grappleFeatNeeded, skillBonus, onChange }) => {
  const { t } = useTranslation();
  return (
    <Stack spacing={2}>
      <ChipRow>
        <Chip size="small" variant="outlined" label={`${t('max-pace')}: ${t(actorRound.movement.maxPace)}`} />
        <Chip
          size="small"
          variant="outlined"
          label={`${t('maneuver-penalty')}: ${formatBonus(actorRound.movement.penalty)}`}
        />
        {/* The movement roll also takes the actor's penalties (`penalty-<source>` in its breakdown). */}
        {modifiers.requiredManeuver &&
          (actorRound.penalty?.modifiers ?? [])
            .filter((penalty) => penalty.value !== 0)
            .map((penalty) => (
              <Chip
                key={penalty.id}
                size="small"
                variant="outlined"
                color={penalty.value < 0 ? 'error' : 'default'}
                label={`${t(`penalty-${penalty.source}`, { defaultValue: penalty.source })}: ${formatBonus(penalty.value)}`}
              />
            ))}
      </ChipRow>
      <Box>
        <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 0.5 }}>
          {t('skill')}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }} role="radiogroup" aria-label={t('skill')}>
          {MOVEMENT_SKILLS.map((skillId) => {
            const bonus = skillBonus(skillId);
            const selected = modifiers.skillId === skillId;
            return (
              <Chip
                key={skillId}
                role="radio"
                aria-checked={selected}
                color={selected ? 'primary' : 'default'}
                label={`${t(skillId)} ${bonus === undefined ? '' : formatBonus(bonus)}`.trim()}
                onClick={() => onChange({ skillId })}
              />
            );
          })}
        </Box>
      </Box>
      {grappleFeatNeeded && (
        <Alert severity="warning" variant="outlined">
          <Stack spacing={1}>
            <span>{t('grapple-feat-help')}</span>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={modifiers.grappleFeat ?? null}
              onChange={(_, value: GrappleFeat | null) => onChange({ grappleFeat: value })}
              aria-label={t('grapple-feat')}
            >
              {GRAPPLE_FEATS.map((feat) => (
                <ToggleButton key={feat} value={feat} color={feat === 'passed' ? 'success' : 'error'}>
                  {t(`grapple-feat-${feat}`)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>
        </Alert>
      )}
      <FormControlLabel
        control={
          <Switch
            checked={modifiers.requiredManeuver}
            onChange={(e) => onChange({ requiredManeuver: e.target.checked })}
          />
        }
        label={t('required-maneuver')}
      />
    </Stack>
  );
};

/** The details of the maneuver roll: after the pace, so that the declaration and the distances read together. */
export const MovementManeuverDetails: FC<{
  gameId: string;
  baseDifficulty: ActorRound['movement']['baseDifficulty'];
  modifiers: Modifiers;
  guide: SkillDifficultyGuide | null;
  onChange: (change: Partial<Modifiers>) => void;
}> = ({ gameId, baseDifficulty, modifiers, guide, onChange }) => {
  const { t } = useTranslation();
  return (
    <Stack spacing={2}>
      <SectionLabel>{t('maneuver-roll')}</SectionLabel>
      <DifficultyPicker
        value={modifiers.difficulty}
        base={baseDifficulty}
        guide={guide}
        onChange={(difficulty) => onChange({ difficulty })}
      />
      <OptionTiles
        label={`${t('lighting')} · ${t('light-usage-helpful')}`}
        options={MOVEMENT_LIGHT_OPTIONS}
        value={modifiers.light ?? ''}
        onChange={(key) => {
          const light = key === modifiers.light ? null : key;
          rememberLight(gameId, light);
          onChange({ light });
        }}
      />
      <Box sx={{ maxWidth: 200 }}>
        <NumberPadField
          steps={[-10, -5, 5, 10]}
          label={t('custom-modifier')}
          value={modifiers.customBonus}
          onChange={(value) => onChange({ customBonus: value || 0 })}
          integer
        />
      </Box>
    </Stack>
  );
};
