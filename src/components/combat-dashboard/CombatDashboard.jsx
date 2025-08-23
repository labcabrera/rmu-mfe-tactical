import React from 'react';
import CombatDashboardTabActions from './CombatDashboardTabActionRounds';
import { CombatProvider } from './CombatProvider';

function CombatDashboard() {
  return (
    <CombatProvider>
      <CombatDashboardTabActions />
    </CombatProvider>
  );
}

export default CombatDashboard;
