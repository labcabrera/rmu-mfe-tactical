import { FC, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ErrorState } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useCombatGame, useCombatActions } from '../combat/combat-context';
import CombatDashboardTabs from './CombatDashboardTabs';

const CombatDashboard: FC = () => {
  const { gameId } = useParams<{ gameId?: string }>();
  const { loadError } = useCombatGame();
  const { setGameId, reloadCombat } = useCombatActions();

  useEffect(() => {
    setGameId(gameId || null);
    return () => setGameId(null);
  }, [gameId, setGameId]);

  if (loadError) return <ErrorState error={loadError} onRetry={reloadCombat} />;

  return <CombatDashboardTabs />;
};

export default CombatDashboard;
