import React, { FC } from 'react';
import { Grid, TextField } from '@mui/material';
import type { Action } from '../../../api/actions';

type ResolveMovementResultsProps = {
  action: Action;
};

const ResolveMovementResults: FC<ResolveMovementResultsProps> = ({ action }) => {
  if (!action || !action.movement || !action.movement.calculated) {
    return <div>Unresolved movement</div>;
  }

  return (
    <Grid container spacing={2}>
      <Grid size={2}>
        <TextField label="action-percent" name="actionPercent" value={action.movement.calculated.percent} variant="standard" fullWidth />
      </Grid>
      <Grid size={2}>
        <TextField label="action-points" name="actionPoints" value={action.actionPoints} variant="standard" fullWidth />
      </Grid>
      <Grid size={2}>
        <TextField label="pace" name="pace" value={action.movement.modifiers.pace} variant="standard" fullWidth />
      </Grid>
      <Grid size={2}>
        <TextField label="distance" name="distance" value={action.movement.calculated.distance} variant="standard" fullWidth />
      </Grid>
      <Grid size={2}>
        <TextField
          label="distance-adjusted"
          name="distanceAdjusted"
          value={action.movement.calculated.distanceAdjusted}
          variant="standard"
          fullWidth
        />
      </Grid>
      <Grid size={2}>
        <TextField label="bmr" name="bmr" value={action.movement.calculated.bmr} variant="standard" fullWidth />
      </Grid>
      <Grid size={2}>
        <TextField label="pace-multiplier" name="paceMultiplier" value={action.movement.calculated.paceMultiplier} variant="standard" fullWidth />
      </Grid>
      <Grid size={2}>
        <TextField label="description" name="description" value={action.movement.calculated.description} variant="standard" fullWidth />
      </Grid>
      <Grid size={2}>
        <TextField label="fatigue" name="fatigue" value={action.fatigue || ''} variant="standard" fullWidth />
      </Grid>
    </Grid>
  );
};

export default ResolveMovementResults;
