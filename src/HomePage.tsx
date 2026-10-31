import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { EntityCard, CardGrid, imageBaseUrl, LayoutBase } from '@labcabrera-rmu/rmu-react-shared-lib';

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
      <CardGrid
        items={OPTIONS}
        getKey={(c) => c.value}
        renderItem={(c) => (
          <EntityCard title={t(c.value)} subtitle={t(c.subtitle)} image={c.image} onClick={() => navigate(c.to)} />
        )}
      />
    </LayoutBase>
  );
};

export default HomePage;
