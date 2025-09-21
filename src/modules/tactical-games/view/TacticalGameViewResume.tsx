import React, { FC } from 'react';
import { Grid, Typography } from '@mui/material';
import { t } from 'i18next';
import type { StrategicGame } from '../../api/strategic-games';
import type { TacticalGame } from '../../api/tactical-games';

const TacticalGameViewResume: FC<{
  tacticalGame: TacticalGame;
  strategicGame?: StrategicGame | null;
}> = ({ tacticalGame, strategicGame }) => {
  if (!tacticalGame || !strategicGame) return <p>Loading...</p>;

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="h6" color="primary" gutterBottom>
          {tacticalGame.name}
        </Typography>
      </Grid>
      <Grid size={12}>
        <Typography variant="body1" gutterBottom>
          {strategicGame.name}
        </Typography>
      </Grid>
      <Grid size={12}>
        <Typography variant="body1" gutterBottom>
          {t(`game-status-${tacticalGame.status}`)} - {t(`${tacticalGame.phase}`)} - {t('round')} {tacticalGame.round}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default TacticalGameViewResume;
