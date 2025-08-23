import React from 'react';
import Grid from '@mui/material/Grid';
import ActionPointSelector from '../../shared/generic/ActionPointSelector';

const AttackResolutionInfo = ({ formData, character }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={2}>
        <ActionPointSelector value={formData.actionPoints} min={2} max={4} />
      </Grid>
    </Grid>
  );
};

export default AttackResolutionInfo;
