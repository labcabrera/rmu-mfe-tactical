import React, { useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CombatContext } from './../../CombatContext';
import CombatDashboardTabActions from './CombatDashboardTabActionRounds';

function CombatDashboard() {
  const { gameId } = useParams();
  const { setGameId } = useContext(CombatContext);

  useEffect(() => {
    setGameId(gameId);
  }, [gameId]);

  return <CombatDashboardTabActions />;
}

export default CombatDashboard;
