/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import {
  CancelButton,
  fetchTacticalGame,
  LoadingState,
  RefreshButton,
  RmuBreadcrumbs,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../CombatContext';
import { useTacticalNotify } from '../services/notify-service';
import EnvironmentButton from '../shared/environment/EnvironmentButton';
import AmbientLightSelect from '../shared/selects/AmbientLightSelect';
import { ApplyOutcomeButton, FinishGameButton } from '../tactical-games/outcome/GameLifecycleButtons';

const CombatDashboardActions: FC = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notify = useTacticalNotify();
  const { displayRound, game, setGame } = useContext(CombatContext)!;
  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);

  const onRefresh = () => {
    fetchTacticalGame(game!.id, auth)
      .then((data) => setGame(data))
      .catch((err) => notify.error(err));
  };

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
      <AmbientLightSelect game={game} onChange={setGame} />
      {/* Workspace spec 079, C3 and C5: fog, extreme temperature and the light source calculator */}
      <EnvironmentButton game={game} onChange={setGame} />
      <FinishGameButton game={game} onFinished={setGame} />
      <ApplyOutcomeButton game={game} onApplied={setGame} />
      <RefreshButton onClick={onRefresh} />
      <CancelButton onClick={onClose} />
    </RmuBreadcrumbs>
  );
};

export default CombatDashboardActions;
