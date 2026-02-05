import React, { FC } from 'react';
import { Chip, Grid, Stack } from '@mui/material';
import { ActorRound, ActorRoundAlert } from '../../api/actor-rounds.dto';
import { NumericInput } from '../../shared/inputs/NumericInput';

const EnduranceForm: FC<{
  actorRound: ActorRound;
  alert: ActorRoundAlert;
}> = ({ actorRound, alert }) => {
  if (!actorRound || !alert) return <p>Loading...</p>;

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Stack direction="column" spacing={1}>
          <Chip label={`Endurance: ${actorRound.fatigue.endurance}`} color="primary" />
          <Chip label={`Encumbrance penalty: ${10000}`} color="primary" />
          <Chip label={`Armor penalty: ${10000}`} color="primary" />
        </Stack>
      </Grid>
      <Grid size={12}>
        <Stack direction="column" spacing={1}>
          <NumericInput label="Days of no sleep (-20)" value={0} onChange={() => {}} />
          <NumericInput label="Days of half sleep (-10)" value={0} onChange={() => {}} />
          <NumericInput label="Hours after a day without water (-5)" value={0} onChange={() => {}} />
          <NumericInput label="Every 8 hours after a day of half water (-5)" value={0} onChange={() => {}} />
          <NumericInput label="Days of no food (-10)" value={0} onChange={() => {}} />
          <NumericInput label="Every 3 days of half rations (-10)" value={0} onChange={() => {}} />
        </Stack>
      </Grid>
    </Grid>
  );
};

export default EnduranceForm;
