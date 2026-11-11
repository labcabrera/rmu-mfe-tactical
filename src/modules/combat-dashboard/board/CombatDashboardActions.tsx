/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CancelButton, LoadingState, RefreshButton, RmuBreadcrumbs } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useCombatGame, useCombatRound, useCombatActions } from '../../combat/combat-context';
import EnvironmentButton from '../../shared/environment/EnvironmentButton';
import AmbientLightSelect from '../../shared/selects/AmbientLightSelect';
import { ApplyOutcomeButton, FinishGameButton } from '../../tactical-games/outcome/GameLifecycleButtons';

const CombatDashboardActions: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { game } = useCombatGame();
  const { displayRound } = useCombatRound();
  const { setGame, reloadCombat } = useCombatActions();
  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);

  const onClose = () => {
    navigate(`/tactical/games/view/${game!.id}`);
  };

  useEffect(() => {
    if (game) {
      setBreadcrumbs([
        { name: t('home'), link: '/' },
        { name: t('tactical-games'), link: '/tactical/games' },
        { name: t('tactical-game'), link: `/tactical/games/view/${game.id}` },
        { name: t('combat') },
      ]);
    }
  }, [game, displayRound]);

  if (!displayRound || !game) return <LoadingState />;

  return (
    <RmuBreadcrumbs items={breadcrumbs}>
      {/* Workspace spec 076: the ambient light, the default of the maneuvers, changes during the combat */}
      <AmbientLightSelect game={game} onChange={setGame} size="small" />
      {/* Workspace spec 079, C3 and C5: fog, light source and extreme temperature */}
      <EnvironmentButton game={game} onChange={setGame} />
      <FinishGameButton game={game} onFinished={setGame} />
      <ApplyOutcomeButton game={game} onApplied={setGame} />
      <RefreshButton onClick={reloadCombat} />
      <CancelButton onClick={onClose} />
    </RmuBreadcrumbs>
  );
};

export default CombatDashboardActions;
