import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ACTION_BUTTON_SIZE } from '../../constants/ui';
import { startRound } from '../api/tactical-games';
import AddButton from '../shared/buttons/AddButton';
import BackButton from '../shared/buttons/BackButton';
import CloseButton from '../shared/buttons/CloseButton';
import NextButton from '../shared/buttons/NextButton';
import { CombatContext } from './CombatProvider';

const CombatDashboardActions = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { displayRound, setDisplayRound } = useContext(CombatContext);
  const { game, setGame } = useContext(CombatContext);

  const handleDisplayPreviousRoundClick = () => {
    setDisplayRound(displayRound > 1 ? displayRound - 1 : 1);
  };

  const handleDisplayNextRoundClick = () => {
    setDisplayRound(displayRound + 1);
  };

  const handleNextRoundClick = async () => {
    try {
      const game = await startRound(game.id);
      setGame(game);
      setDisplayRound(game.round);
    } catch (error) {
      console.error('CombatDashboardActions.fecthCharacterRounds error: ' + error);
    }
  };

  const handleCloseDashboardClick = () => {
    navigate(`/tactical/view/${game.id}`, { state: { game } });
  };

  if (!displayRound || !game) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
        <Box>
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="/">
              Home
            </Link>
            <Link component={RouterLink} underline="hover" color="inherit" to="/tactical/games">
              Tactical
            </Link>
            <Link component={RouterLink} underline="hover" color="inherit" to="/tactical/games">
              Games
            </Link>
            <Link component={RouterLink} underline="hover" color="inherit" to={`/tactical/games/view/${game.id}`}>
              {game.name}
            </Link>
            <Typography sx={{ color: 'text.primary' }}>
              Round {displayRound} of {game.round}
            </Typography>
            <Typography sx={{ color: 'text.primary' }}>{t(`phase-${game.phase}`)}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={2}>
          <BackButton onClick={handleDisplayPreviousRoundClick} disabled={displayRound === 1} size={ACTION_BUTTON_SIZE} />
          <NextButton onClick={handleDisplayNextRoundClick} disabled={displayRound === game.round} size={ACTION_BUTTON_SIZE} />
          <AddButton onClick={handleNextRoundClick} size={ACTION_BUTTON_SIZE} />
          <CloseButton onClick={handleCloseDashboardClick} size={ACTION_BUTTON_SIZE} />
        </Stack>
      </Stack>
    </>
  );
};

export default CombatDashboardActions;
