import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Grid } from '@mui/material';
import { LayoutBase, RmuTextCard } from '@labcabrera-rmu/rmu-react-shared-lib';
import { imageBaseUrl } from './modules/services/config';
import { gridSizeCard } from './modules/services/display';

const OPTIONS = [
  {
    value: 'tactical-games',
    subtitle: 'manage-tactical-games',
    image: `${imageBaseUrl}images/generic/tactical.png`,
    to: '/tactical/games',
  },
];

const HomePage: FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <LayoutBase breadcrumbs={[{ name: t('home'), link: '/' }, { name: t('tactical-module') }]}>
      <Grid container spacing={1}>
        {OPTIONS.map((c) => (
          <Grid size={gridSizeCard} key={c.value}>
            <RmuTextCard value={t(c.value)} subtitle={t(c.subtitle)} image={c.image} onClick={() => navigate(c.to)} />
          </Grid>
        ))}
      </Grid>
    </LayoutBase>
  );
};

export default HomePage;
