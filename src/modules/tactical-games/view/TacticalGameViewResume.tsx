import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Grid, Typography } from '@mui/material';
import { RmuTextCard, StrategicGame, TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { defaultImage } from '../../services/image-service';

const TacticalGameViewResume: FC<{
  tacticalGame: TacticalGame;
  strategicGame?: StrategicGame | null;
}> = ({ tacticalGame, strategicGame }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  if (!tacticalGame || !strategicGame) return <p>Loading...</p>;

  const getStatus = () => {
    if (tacticalGame.round < 1) {
      return t('Not started');
    }
    return `${t(`Round`)} ${tacticalGame.round}`;
  };

  return (
    <Grid container spacing={1}>
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
        <RmuTextCard
          value={strategicGame.name}
          subtitle={t('Strategic game')}
          image={strategicGame.imageUrl || ''}
          onClick={() => navigate(`/strategic/games/view/${strategicGame.id}`)}
        />
      </Grid>
      <Grid size={12}>
        <RmuTextCard value={getStatus()} subtitle={t('Status')} image={defaultImage} />
      </Grid>
    </Grid>
  );
};

export default TacticalGameViewResume;
