import React, { FC } from 'react';
import { Grid, Typography } from '@mui/material';
import { t } from 'i18next';
import { TacticalGame } from '../../api/tactical-game.dto';

const TacticalGameViewEnvironment: FC<{
  tacticalGame: TacticalGame;
}> = ({ tacticalGame }) => {
  if (!tacticalGame) return <p>Loading game...</p>;

  if (!tacticalGame.environment) return null;

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Typography variant="h6" color="primary" gutterBottom>
            {t('Environment')}
          </Typography>
        </Grid>
        <Grid size={12}>
          <Typography variant="body1" color="primary" gutterBottom>
            {t('Temperature')}: {tacticalGame.environment.temperatureFatigueModifier}
          </Typography>
        </Grid>
        <Grid size={12}>
          <Typography variant="body1" color="primary" gutterBottom>
            {t('Altitude')}: {tacticalGame.environment.altitudeFatigueModifier}
          </Typography>
        </Grid>
      </Grid>
    </>
  );
};

export default TacticalGameViewEnvironment;
