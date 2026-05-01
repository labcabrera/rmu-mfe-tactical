import React, { FC } from 'react';
import { Grid } from '@mui/material';
import { CategorySeparator, RmuTextCard, TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { defaultImage } from '../../services/image-service';

const TacticalGameViewEnvironment: FC<{
  tacticalGame: TacticalGame;
}> = ({ tacticalGame }) => {
  if (!tacticalGame) return <p>Loading game...</p>;

  if (!tacticalGame.environment) return null;

  return (
    <>
      <CategorySeparator text={t('Environment')} />
      <Grid container spacing={1}>
        <Grid size={12}>
          <RmuTextCard
            value={tacticalGame.environment.temperatureFatigueModifier}
            subtitle={t('Temperature modifier')}
            image={defaultImage}
            applyColor
          />
        </Grid>
        <Grid size={12}>
          <RmuTextCard
            value={tacticalGame.environment.altitudeFatigueModifier}
            subtitle={t('Altitude modifier')}
            image={defaultImage}
            applyColor
          />
        </Grid>
      </Grid>
    </>
  );
};

export default TacticalGameViewEnvironment;
