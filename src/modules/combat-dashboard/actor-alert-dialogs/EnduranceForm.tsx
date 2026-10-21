import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Stack, Typography } from '@mui/material';
import { NumericInput, OpenEndedRollInput, RollBreakdown, TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { ActorRound } from '../../api/actor-rounds.dto';

/** Table 5-5 deprivation modifiers: translation key and value per unit (day, hour...). */
const DEPRIVATION: { key: string; perUnit: number }[] = [
  { key: 'endurance-days-no-sleep', perUnit: -20 },
  { key: 'endurance-days-half-sleep', perUnit: -10 },
  { key: 'endurance-hours-no-water', perUnit: -5 },
  { key: 'endurance-hours-half-water', perUnit: -5 },
  { key: 'endurance-days-no-food', perUnit: -10 },
  { key: 'endurance-days-half-rations', perUnit: -10 },
];

export type EnduranceFormValue = {
  roll: number | null;
  /** Units of each deprivation modifier, by key. */
  deprivation: Record<string, number | null>;
  customBonus: number | null;
};

export const emptyEnduranceForm = (): EnduranceFormValue => ({ roll: null, deprivation: {}, customBonus: null });

/**
 * Modifiers of an endurance roll (§5.5): the actor's endurance bonus, its accumulated fatigue, its maneuver penalty,
 * the game's temperature and altitude, the deprivation modifiers and a custom bonus. The API adds them to the roll.
 */
export const enduranceModifiers = (
  actorRound: ActorRound,
  game: TacticalGame | null,
  value: EnduranceFormValue
): { key: string; value: number }[] =>
  [
    { key: 'endurance', value: actorRound.fatigue?.endurance ?? 0 },
    { key: 'penalty-fatigue', value: -(actorRound.fatigue?.fatigue ?? 0) },
    { key: 'maneuver-penalty', value: actorRound.movement?.penalty ?? 0 },
    { key: 'temperature-modifier', value: game?.environment?.temperatureFatigueModifier ?? 0 },
    { key: 'altitude-modifier', value: game?.environment?.altitudeFatigueModifier ?? 0 },
    ...DEPRIVATION.map((d) => ({ key: d.key, value: (value.deprivation[d.key] ?? 0) * d.perUnit })),
    { key: 'custom-bonus', value: value.customBonus ?? 0 },
  ].filter((modifier) => modifier.value !== 0);

/** Endurance roll of an endurance alert: modifiers, the open-ended roll and the predicted total. */
const EnduranceForm: FC<{
  actorRound: ActorRound;
  value: EnduranceFormValue;
  onChange: (value: EnduranceFormValue) => void;
}> = ({ actorRound, value, onChange }) => {
  const { t } = useTranslation();
  const { game } = useContext(CombatContext)!;
  const modifiers = enduranceModifiers(actorRound, game, value);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="subtitle2" gutterBottom>
          {t('modifiers')}
        </Typography>
        <Stack spacing={1.5}>
          {DEPRIVATION.map((d) => (
            <Box key={d.key} sx={{ maxWidth: 320 }}>
              <NumericInput
                label={t(d.key, { modifier: d.perUnit })}
                value={value.deprivation[d.key] ?? null}
                onChange={(units) => onChange({ ...value, deprivation: { ...value.deprivation, [d.key]: units } })}
                min={0}
                allowNegatives={false}
                integer
              />
            </Box>
          ))}
          <Box sx={{ maxWidth: 320 }}>
            <NumericInput
              label={t('custom-bonus')}
              value={value.customBonus}
              onChange={(customBonus) => onChange({ ...value, customBonus })}
              integer
            />
          </Box>
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {t('roll')}
            </Typography>
            <OpenEndedRollInput
              inputGridSize={6}
              label={t('endurance-roll')}
              value={value.roll}
              onChange={(roll) => onChange({ ...value, roll })}
            />
          </Box>
          <RollBreakdown
            modifiers={modifiers}
            roll={value.roll}
            totalLabel={value.roll === null ? t('predicted-total') : t('total')}
          />
        </Stack>
      </Grid>
    </Grid>
  );
};

export default EnduranceForm;
