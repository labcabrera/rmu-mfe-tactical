import React, { FC, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ButtonGroup } from '@mui/material';
import { BackButton, CancelButton, NextButton, RmuBreadcrumbs } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { CombatContext } from '../../CombatContext';
import { useError } from '../../ErrorContext';
import { startRound, startPhase } from '../api/tactical-game';
import { TacticalGame } from '../api/tactical-game.dto';

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

  const onNextRound = async () => {
    startRound(game!.id)
      .then((game: TacticalGame) => {
        setGame(game);
        setDisplayRound(game.round);
      })
      .catch((err) => showError(err.message));
  };

  const onNextPhase = async () => {
    startPhase(game!.id)
      .then((game: TacticalGame) => setGame(game))
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
    <>
      <RmuBreadcrumbs items={breadcrumbs}>
        <BackButton onClick={onDisplayPrevRound} disabled={displayRound === 1} />
        <NextButton onClick={onDisplayNextRound} disabled={displayRound === game.round} />
        <CancelButton onClick={onClose} />
      </RmuBreadcrumbs>
      {game.round === displayRound && (
        <TurnPhaseButtons game={game} onNextPhase={onNextPhase} onNextRound={onNextRound} />
      )}
    </>
  );
};

const TurnPhaseButtons: FC<{ game: TacticalGame; onNextPhase: () => void; onNextRound: () => void }> = ({
  game,
  onNextPhase,
  onNextRound,
}) => {
  return (
    <ButtonGroup variant="contained">
      <Button
        value="left"
        color={game.phase === 'declare_initiative' ? 'secondary' : 'primary'}
        disabled={game.phase !== 'declare_initiative'}
        sx={{
          cursor: 'default',
          pointerEvents: 'none',
          '&:hover': {
            backgroundColor: 'inherit',
          },
          '&:active': {
            boxShadow: 'none',
            transform: 'none',
          },
          '&:focus': {
            outline: 'none',
          },
        }}
      >
        Initiative
      </Button>
      <TurnPhaseButton
        game={game}
        phase={'phase_1'}
        enabledPhases={['phase_1', 'declare_initiative']}
        onNextPhase={onNextPhase}
      />
      <TurnPhaseButton game={game} phase={'phase_2'} enabledPhases={['phase_1', 'phase_2']} onNextPhase={onNextPhase} />
      <TurnPhaseButton game={game} phase={'phase_3'} enabledPhases={['phase_2', 'phase_3']} onNextPhase={onNextPhase} />
      <TurnPhaseButton game={game} phase={'phase_4'} enabledPhases={['phase_3', 'phase_4']} onNextPhase={onNextPhase} />
      <TurnPhaseButton game={game} phase={'upkeep'} enabledPhases={['phase_4', 'upkeep']} onNextPhase={onNextPhase} />
      <Button onClick={onNextRound} disabled={game.phase !== 'upkeep'}>
        Next round
      </Button>
    </ButtonGroup>
  );
};

const TurnPhaseButton: FC<{ game: TacticalGame; phase: string; enabledPhases: string[]; onNextPhase?: () => void }> = ({
  game,
  phase,
  enabledPhases,
  onNextPhase,
}) => {
  const disabled = !enabledPhases.includes(game.phase);
  const samePhase = game.phase === phase;
  return (
    <Button
      color={samePhase ? 'secondary' : 'primary'}
      sx={{ pointer: samePhase ? 'default' : 'pointer' }}
      disabled={disabled}
      onClick={samePhase ? undefined : onNextPhase}
    >
      {t(phase)}
    </Button>
  );
};

export default CombatDashboardActions;
