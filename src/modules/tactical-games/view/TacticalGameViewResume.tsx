import React, { FC } from 'react';
import { Grid, Typography } from '@mui/material';
import { RmuTextCard } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import type { StrategicGame } from '../../api/strategic-games';
import { TacticalGame } from '../../api/tactical-game.dto';
import { defaultImage } from '../../services/image-service';

const TacticalGameViewResume: FC<{
  tacticalGame: TacticalGame;
  strategicGame?: StrategicGame | null;
}> = ({ tacticalGame, strategicGame }) => {
  if (!tacticalGame || !strategicGame) return <p>Loading...</p>;

  const getStatus = () => {
    if (tacticalGame.round < 1) {
      return t('Not started');
    }
    return `${t(`Round`)} ${tacticalGame.round}`;
  };

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
        <RmuTextCard value={getStatus()} subtitle={t('Status')} image={defaultImage} />
      </Grid>
    </Grid>
  );
};

export default TacticalGameViewResume;
