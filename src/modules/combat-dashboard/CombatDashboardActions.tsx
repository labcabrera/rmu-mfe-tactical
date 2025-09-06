import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Breadcrumbs, Button, Link, Stack, Typography } from '@mui/material';
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
  const { t } = useTranslation();
  const { displayRound, setDisplayRound, game, setGame } = useContext(CombatContext)!;
  const { showError } = useError();

  const handleDisplayPreviousRoundClick = () => {
    setDisplayRound(displayRound > 1 ? displayRound - 1 : 1);
  };

  const handleDisplayNextRoundClick = () => {
    setDisplayRound(displayRound + 1);
  };

  const handleNextRoundClick = async () => {
    startRound(game.id)
      .then((game: TacticalGame) => {
        setGame(game);
        setDisplayRound(game.round);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError(String(err));
      });
  };

  const handleNextPhaseClick = async () => {
    startPhase(game.id)
      .then((game: TacticalGame) => {
        setGame(game);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError(String(err));
      });
  };

  const handleCloseDashboardClick = () => {
    navigate(`/tactical/view/${game.id}`, { state: { game } });
  };

  const nextPhaseAvailable = () => {
    return game.phase !== 'phase_4';
  };

  if (!displayRound || !game) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
        <Box>
          <Breadcrumbs aria-label="breadcrumb">
            <Link color="inherit" href="/">
              {t('home')}
            </Link>
            <Link component={RouterLink} color="inherit" to="/tactical/games">
              {t('tactical')}
            </Link>
            <Link component={RouterLink} color="inherit" to="/tactical/games">
              {t('games')}
            </Link>
            <Link component={RouterLink} color="inherit" to={`/tactical/games/view/${game.id}`}>
              {game.name}
            </Link>
            <Typography sx={{ color: 'text.primary' }}>
              Round {displayRound} of {game.round}
            </Typography>
            <Typography sx={{ color: 'text.primary' }}>{t(game.phase)}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={2}>
          <BackButton onClick={handleDisplayPreviousRoundClick} disabled={displayRound === 1} size={80} />
          <NextButton onClick={handleDisplayNextRoundClick} disabled={displayRound === game.round} size={80} />
          <AddButton onClick={handleNextRoundClick} size={80} />
          <CloseButton onClick={handleCloseDashboardClick} size={80} />
          {nextPhaseAvailable() ? (
            <Button onClick={handleNextPhaseClick}>Next phase</Button>
          ) : (
            <Button onClick={handleNextRoundClick}>Next round</Button>
          )}
        </Stack>
      </Stack>
    </>
  );
};

export default CombatDashboardActions;
