import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid } from '@mui/material';
import { CategorySeparator, RmuTextCard, TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { defaultImage } from '../../services/image-service';

const TacticalGameViewEnvironment: FC<{
  tacticalGame: TacticalGame;
}> = ({ tacticalGame }) => {
  const { t } = useTranslation();

  if (!tacticalGame) return <p>Loading game...</p>;

  if (!tacticalGame.environment) return null;

  return (
    <>
      <CategorySeparator text={t('environment')} />
      <Grid container spacing={1}>
        <Grid size={12}>
          <RmuTextCard
            value={tacticalGame.environment.temperatureFatigueModifier}
            subtitle={t('temperature-modifier')}
            image={defaultImage}
            applyColor
          />
        </Grid>
        <Grid size={12}>
          <RmuTextCard
            value={tacticalGame.environment.altitudeFatigueModifier}
            subtitle={t('altitude-modifier')}
            image={defaultImage}
            applyColor
          />
        </Grid>
      </Grid>
    </>
  );
};

export default TacticalGameViewEnvironment;
