/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import {
  BackButton,
  CancelButton,
  fetchTacticalGame,
  LoadingState,
  NextButton,
  RefreshButton,
  RmuBreadcrumbs,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../CombatContext';

const CombatDashboardActions: FC = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notify = useNotify();
  const { displayRound, setDisplayRound, game, setGame } = useContext(CombatContext)!;
  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);

  const onDisplayPrevRound = () => {
    setDisplayRound(displayRound! > 1 ? displayRound! - 1 : 1);
  };

  const onDisplayNextRound = () => {
    setDisplayRound(displayRound! + 1);
  };

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
        { name: t('round-n-of-total', { round: displayRound, total: game.round }) },
      ]);
    }
  }, [game, displayRound]);

  if (!displayRound || !game) return <LoadingState />;

  return (
    <RmuBreadcrumbs items={breadcrumbs}>
      <BackButton onClick={onDisplayPrevRound} disabled={displayRound === 1} tooltip={t('display-previous-round')} />
      <NextButton
        onClick={onDisplayNextRound}
        disabled={displayRound === game.round}
        tooltip={t('display-next-round')}
      />
      <RefreshButton onClick={onRefresh} />
      <CancelButton onClick={onClose} />
    </RmuBreadcrumbs>
  );
};

export default CombatDashboardActions;
