/* eslint-disable react/prop-types */
import React from 'react';
import { Grid, TextField } from '@mui/material';

const ResolveMovementResults = ({ action }) => {
  if (!action?.movement?.calculated) {
    return <div>Unresolved movement</div>;
  }

  return (
    <Grid container spacing={2}>
      <Grid size={2}>
        <TextField label="action-percent" name="actionPercent" value={action.movement.calculated?.percent} variant="standard" fullWidth />
      </Grid>
      <Grid size={2}>
        <TextField label="bmr" name="bmr" value={action.movement.calculated?.bmr} variant="standard" fullWidth />
      </Grid>
      <Grid size={2}>
        <TextField label="pace-multiplier" name="paceMultiplier" value={action.movement.calculated?.paceMultiplier} variant="standard" fullWidth />
      </Grid>
    </Grid>
  );
};

export default ResolveMovementResults;
