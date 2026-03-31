import React, { FC, useContext } from 'react';
import { Chip, Grid, Stack, Typography } from '@mui/material';
import { NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { ActorRound, ActorRoundAlert } from '../../api/actor-rounds.dto';

const EnduranceForm: FC<{
  actorRound: ActorRound;
  alert: ActorRoundAlert;
}> = ({ actorRound, alert }) => {
  const { game } = useContext(CombatContext)!;

  if (!actorRound || !alert) return <p>Loading...</p>;

  const temperatureModifier = game?.environment?.temperatureFatigueModifier ?? 0;
  const altitudeModifier = game?.environment?.altitudeFatigueModifier ?? 0;

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Stack direction="column" spacing={2}>
          <Chip label={`Endurance: ${actorRound.fatigue.endurance}`} color="primary" />
          <Chip label={`Encumbrance penalty: ${10000}`} color="primary" />
          <Chip label={`Armor penalty: ${10000}`} color="primary" />
          <Chip label={`Temperature modifier: ${temperatureModifier}`} color="primary" />
          <Chip label={`Altitude modifier: ${altitudeModifier}`} color="primary" />
        </Stack>
      </Grid>
      <Grid size={12}>
        <Typography variant="h6" gutterBottom>
          Modifiers
        </Typography>
        <Stack direction="column" spacing={2}>
          <NumericInput label="Days of no sleep (-20)" value={0} onChange={() => {}} />
          <NumericInput label="Days of half sleep (-10)" value={0} onChange={() => {}} />
          <NumericInput label="Hours after a day without water (-5)" value={0} onChange={() => {}} />
          <NumericInput label="Every 8 hours after a day of half water (-5)" value={0} onChange={() => {}} />
          <NumericInput label="Days of no food (-10)" value={0} onChange={() => {}} />
          <NumericInput label="Every 3 days of half rations (-10)" value={0} onChange={() => {}} />
        </Stack>
      </Grid>
      <Grid size={12}>
        <Typography variant="h6" gutterBottom>
          Roll
        </Typography>
        <Stack direction="column" spacing={1}>
          <NumericInput label="Endurance roll" value={0} onChange={() => {}} />
        </Stack>
      </Grid>
    </Grid>
  );
};

export default EnduranceForm;
