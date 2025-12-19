import React, { FC, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Breadcrumbs, Button, Link, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../CombatContext';
import { useError } from '../../ErrorContext';
import { startRound, startPhase } from '../api/tactical-games';
import type { TacticalGame } from '../api/tactical-games';
import AddButton from '../shared/buttons/AddButton';
import BackButton from '../shared/buttons/BackButton';
import CloseButton from '../shared/buttons/CloseButton';
import NextButton from '../shared/buttons/NextButton';

const CombatDashboardActions: FC = () => {
  const navigate = useNavigate();
  const { showError } = useError();
  const { displayRound, setDisplayRound, game, setGame } = useContext(CombatContext)!;

  const onDisplayPrevRound = () => {
    setDisplayRound(displayRound > 1 ? displayRound - 1 : 1);
  };

  const onDisplayNextRound = () => {
    setDisplayRound(displayRound + 1);
  };

  const onNextRound = async () => {
    startRound(game.id)
      .then((game: TacticalGame) => {
        setGame(game);
        setDisplayRound(game.round);
      })
      .catch((err) => showError(err.message));
  };

  const onNextPhase = async () => {
    startPhase(game.id)
      .then((game) => setGame(game))
      .catch((err) => showError(err.message));
  };

  const onClose = () => {
    navigate(`/tactical/view/${game.id}`, { state: { game } });
  };

  const nextPhaseAvailable = () => {
    return game.phase !== 'upkeep';
  };

  if (!displayRound || !game) return <p>Loading...</p>;

  return (
    <>
      <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
        <Box>
          <Breadcrumbs aria-label="breadcrumb">
            <Link color="primary" underline="hover" href="/">
              {t('home')}
            </Link>
            <Link component={RouterLink} color="primary" underline="hover" to="/tactical/games">
              {t('tactical')}
            </Link>
            <Link component={RouterLink} color="primary" underline="hover" to="/tactical/games">
              {t('games')}
            </Link>
            <Link component={RouterLink} color="primary" underline="hover" to={`/tactical/games/view/${game.id}`}>
              {game.name}
            </Link>
            <Typography color="secondary">
              Round {displayRound} of {game.round}
            </Typography>
            <Typography color="secondary">{t(game.phase)}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={2}>
          <BackButton onClick={onDisplayPrevRound} disabled={displayRound === 1} size={80} />
          <NextButton onClick={onDisplayNextRound} disabled={displayRound === game.round} size={80} />
          <AddButton onClick={onNextRound} />
          <CloseButton onClick={onClose} />
          {nextPhaseAvailable() ? (
            <Button onClick={onNextPhase}>Next phase</Button>
          ) : (
            <Button onClick={onNextRound}>Next round</Button>
          )}
        </Stack>
      </Stack>
    </>
  );
};

export default CombatDashboardActions;
