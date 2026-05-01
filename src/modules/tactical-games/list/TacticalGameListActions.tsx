import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AddButton, RefreshButton, RmuBreadcrumbs } from '@labcabrera-rmu/rmu-react-shared-lib';

export default function TacticalGameListActions() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const onNewTacticalGame = async () => {
    navigate('/tactical/games/create');
  };

  return (
    <RmuBreadcrumbs items={[{ name: t('home'), link: '/' }, { name: t('tactical-games') }]}>
      <RefreshButton onClick={() => {}} />
      <AddButton onClick={() => onNewTacticalGame()} />
    </RmuBreadcrumbs>
  );
}
