import React from 'react';
import CombatActorRoundList from './CombatActorRoundList';
import CombatDashboardActions from './CombatDashboardActions';

const CombatDashboardTabActions = () => {
  return (
    <>
      <CombatDashboardActions />
      <CombatActorRoundList />
    </>
  );
};

export default CombatDashboardTabActions;
