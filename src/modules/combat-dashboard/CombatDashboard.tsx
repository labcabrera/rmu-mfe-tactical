import React, { FC, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CombatContext } from '../../CombatContext';
import CombatDashboardTabActions from './CombatDashboardTabActionRounds';

const CombatDashboard: FC = () => {
  const { gameId } = useParams<{ gameId?: string }>();
  const { setGameId } = useContext(CombatContext)!;

  useEffect(() => {
    setGameId(gameId || null);
  }, [gameId, setGameId]);

  return <CombatDashboardTabActions />;
};

export default CombatDashboard;
