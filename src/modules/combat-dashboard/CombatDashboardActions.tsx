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
import { ApplyOutcomeButton, FinishGameButton } from '../tactical-games/outcome/GameLifecycleButtons';
import { useTacticalNotify } from '../services/notify-service';

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
      <FinishGameButton game={game} onFinished={setGame} />
      <ApplyOutcomeButton game={game} onApplied={setGame} />
      <RefreshButton onClick={onRefresh} />
      <CancelButton onClick={onClose} />
    </RmuBreadcrumbs>
  );
};

export default CombatDashboardActions;
