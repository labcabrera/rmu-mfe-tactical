import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, Grid, Stack, Typography } from '@mui/material';
import { NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { ActorRound, ActorRoundAlert } from '../../api/actor-rounds.dto';

const EnduranceForm: FC<{
  actorRound: ActorRound;
  alert: ActorRoundAlert;
}> = ({ actorRound, alert }) => {
  const { t } = useTranslation();
  const { game } = useContext(CombatContext)!;

  if (!actorRound || !alert) return null;

  const temperatureModifier = game?.environment?.temperatureFatigueModifier ?? 0;
  const altitudeModifier = game?.environment?.altitudeFatigueModifier ?? 0;

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Stack direction="column" spacing={2}>
          <Chip label={`${t('endurance')}: ${actorRound.fatigue.endurance}`} color="primary" />
          <Chip label={`${t('encumbrance-penalty')}: ${10000}`} color="primary" />
          <Chip label={`${t('armor-penalty')}: ${10000}`} color="primary" />
          <Chip label={`${t('temperature-modifier')}: ${temperatureModifier}`} color="primary" />
          <Chip label={`${t('altitude-modifier')}: ${altitudeModifier}`} color="primary" />
        </Stack>
      </Grid>
      <Grid size={12}>
        <Typography variant="h6" gutterBottom>
          {t('modifiers')}
        </Typography>
        <Stack direction="column" spacing={2}>
          <NumericInput label={t('endurance-days-no-sleep', { modifier: -20 })} value={0} onChange={() => {}} />
          <NumericInput label={t('endurance-days-half-sleep', { modifier: -10 })} value={0} onChange={() => {}} />
          <NumericInput label={t('endurance-hours-no-water', { modifier: -5 })} value={0} onChange={() => {}} />
          <NumericInput label={t('endurance-hours-half-water', { modifier: -5 })} value={0} onChange={() => {}} />
          <NumericInput label={t('endurance-days-no-food', { modifier: -10 })} value={0} onChange={() => {}} />
          <NumericInput label={t('endurance-days-half-rations', { modifier: -10 })} value={0} onChange={() => {}} />
        </Stack>
      </Grid>
      <Grid size={12}>
        <Typography variant="h6" gutterBottom>
          {t('roll')}
        </Typography>
        <Stack direction="column" spacing={1}>
          <NumericInput label={t('endurance-roll')} value={0} onChange={() => {}} />
        </Stack>
      </Grid>
    </Grid>
  );
};

export default EnduranceForm;
