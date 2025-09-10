import React, { FC, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CombatContext } from '../../CombatContext';
import CombatDashboardTabs from './CombatDashboardTabs';

const CombatDashboard: FC = () => {
  const { gameId } = useParams<{ gameId?: string }>();
  const { setGameId } = useContext(CombatContext)!;

  useEffect(() => {
    setGameId(gameId || null);
  }, [gameId, setGameId]);

  return <CombatDashboardTabs />;
};

export default CombatDashboard;
