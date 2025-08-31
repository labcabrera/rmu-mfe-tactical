import React, { useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CombatDashboardTabActions from './CombatDashboardTabActionRounds';
import { CombatContext } from './CombatProvider';

function CombatDashboard() {
  const { gameId } = useParams();
  const { setGameId } = useContext(CombatContext);

  useEffect(() => {
    setGameId(gameId);
  }, [gameId]);

  return <CombatDashboardTabActions />;
}

export default CombatDashboard;
