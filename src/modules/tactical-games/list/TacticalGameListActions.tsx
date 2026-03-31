import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AddButton, RefreshButton, RmuBreadcrumbs } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';

const TacticalGameListActions: React.FC = () => {
  const navigate = useNavigate();

  const onNewTacticalGame = async () => {
    navigate('/tactical/games/create');
  };

  return (
    <RmuBreadcrumbs items={[{ name: t('Tactical games') }]}>
      <RefreshButton onClick={() => {}} />
      <AddButton onClick={() => onNewTacticalGame()} />
    </RmuBreadcrumbs>
  );
};

export default TacticalGameListActions;
