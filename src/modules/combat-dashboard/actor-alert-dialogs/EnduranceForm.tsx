import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Stack, Typography } from '@mui/material';
import {
  ELEMENTAL_ENVIRONMENT_KEY,
  elementalModifier,
  elementOf,
  NumberPadField,
  OPEN_D100,
  RollBreakdown,
  RollField,
  RollModifier,
  TacticalGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { ActorRound } from '../../api/actor-rounds.dto';
import { actorOpenEnded } from '../../services/combat-talents-service';

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
 * Modifiers of an endurance roll (§5.5): the actor's endurance bonus, its accumulated fatigue, the game's temperature
 * and altitude, the deprivation modifiers and a custom bonus. The API adds them to the roll, and adds by itself the
 * load penalty of the character sheet as `encumbrance` (workspace spec 077, decision B1.6): the form no longer sends the
 * maneuver penalty of the actor, which included it.
 */
export const enduranceModifiers = (
  actorRound: ActorRound,
  game: TacticalGame | null,
  value: EnduranceFormValue
): RollModifier[] =>
  // Spec 052: the rule each entry comes from (§5.5, Table 5-5)
  (
    [
      { key: 'endurance', value: actorRound.fatigue?.endurance ?? 0, group: 'skill', rule: '§5.5' },
      { key: 'penalty-fatigue', value: -(actorRound.fatigue?.fatigue ?? 0), group: 'penalty', rule: '§5.5' },
      {
        key: 'temperature-modifier',
        value: game?.environment?.temperatureFatigueModifier ?? 0,
        group: 'situation',
        rule: '§5.5',
      },
      {
        key: 'altitude-modifier',
        value: game?.environment?.altitudeFatigueModifier ?? 0,
        group: 'situation',
        rule: '§5.5',
      },
      // Workspace spec 079, D4: Elemental Resistance/Susceptibility against the extreme temperature (the API adds it too)
      {
        key: ELEMENTAL_ENVIRONMENT_KEY,
        value: elementalModifier(actorRound.traits, elementOf(game?.environment?.extremeTemperature?.kind)),
        group: 'talent',
        rule: 'Core Law ch. 4',
        params: game?.environment?.extremeTemperature?.kind
          ? { element: game.environment.extremeTemperature.kind }
          : undefined,
      },
      ...DEPRIVATION.map((d) => ({
        key: d.key,
        value: (value.deprivation[d.key] ?? 0) * d.perUnit,
        group: 'situation',
        rule: 'Table 5-5',
        params: { units: value.deprivation[d.key] ?? 0, perUnit: d.perUnit, modifier: d.perUnit },
      })),
      { key: 'custom-bonus', value: value.customBonus ?? 0, group: 'situation' },
    ] as RollModifier[]
  ).filter((modifier) => modifier.value !== 0);

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
              <NumberPadField
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
            <NumberPadField
              steps={[-10, -5, 5, 10]}
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
            <RollField
              spec={OPEN_D100}
              label={t('endurance-roll')}
              value={value.roll}
              onChange={(roll) => onChange({ ...value, roll: roll.total })}
              openEnded={actorOpenEnded(actorRound)}
            />
          </Box>
          <RollBreakdown
            context="endurance"
            modifiers={modifiers}
            roll={value.roll}
            totalLabel={value.roll === null ? t('predicted-total') : t('total')}
          />
          {actorRound.characterId && (
            <Typography variant="caption" color="text.secondary">
              {t('endurance-encumbrance-auto')}
            </Typography>
          )}
        </Stack>
      </Grid>
    </Grid>
  );
};

export default EnduranceForm;
