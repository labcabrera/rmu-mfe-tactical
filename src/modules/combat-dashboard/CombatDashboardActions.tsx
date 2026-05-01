/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import {
  BackButton,
  CancelButton,
  fetchTacticalGame,
  NextButton,
  RefreshButton,
  RmuBreadcrumbs,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../CombatContext';
import { useError } from '../../ErrorContext';

const CombatDashboardActions: FC = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showError } = useError();
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
      .catch((err) => showError(err.message));
  };

  const onClose = () => {
    navigate(`/tactical/games/view/${game!.id}`);
  };

  useEffect(() => {
    if (game) {
      setBreadcrumbs([
        { name: t('tactical-games'), link: '/tactical' },
        { name: t('tactical-game'), link: `/tactical/games/view/${game.id}` },
        { name: `Round ${displayRound} of ${game.round}` },
      ]);
    }
  }, [game, displayRound]);

  if (!displayRound || !game) return <p>Loading...</p>;

  return (
    <RmuBreadcrumbs items={breadcrumbs}>
      <BackButton onClick={onDisplayPrevRound} disabled={displayRound === 1} tooltip={t('Display previous round')} />
      <NextButton
        onClick={onDisplayNextRound}
        disabled={displayRound === game.round}
        tooltip={t('Display next round')}
      />
      <RefreshButton onClick={onRefresh} />
      <CancelButton onClick={onClose} />
    </RmuBreadcrumbs>
  );
};

export default CombatDashboardActions;
