import React, { FC } from 'react';
import { Grid, Typography } from '@mui/material';

const TacticalGameResume: FC = () => {
  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="body1" gutterBottom>
          A tactical game represents an encounter between several factions or environmental NPCs, which generally
          involves combat between them.
        </Typography>
        <Typography variant="body1" gutterBottom>
          A tactical game is part of a strategic game that defines the characters that will be part of the game.
        </Typography>
      </Grid>
    </Grid>
  );
};

export default TacticalGameResume;
