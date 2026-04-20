import React, { FC, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BackButton,
  CancelButton,
  fetchTacticalGame,
  NextButton,
  RefreshButton,
  RmuBreadcrumbs,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { CombatContext } from '../../CombatContext';
import { useError } from '../../ErrorContext';

const CombatDashboardActions: FC = () => {
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
    fetchTacticalGame(game!.id)
      .then((data) => setGame(data))
      .catch((err) => showError(err.message));
  };

  const onClose = () => {
    navigate(`/tactical/games/view/${game!.id}`);
  };

  useEffect(() => {
    if (game) {
      setBreadcrumbs([
        { name: t('Tactical'), link: '/tactical' },
        { name: t('Game'), link: `/tactical/games/view/${game.id}` },
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
