import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Box, Grid, IconButton, Typography } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { fetchTacticalGames } from '../../api/tactical-games';
import type { TacticalGame } from '../../api/tactical-games';
import TacticalGameCard from '../../shared/cards/TacticalGameCard';
import TacticalGameListActions from './TacticalGameListActions';

const TacticalGameList: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showError } = useError();
  const [games, setGames] = useState<TacticalGame[]>([]);

  const fetchGames = () => {
    fetchTacticalGames('', 0, 20)
      .then((response) => {
        setGames(response);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError('An unknown error occurred');
      });
  };

  const handleNewGame = () => {
    navigate('/tactical/games/create');
  };

  const onTacticalGameClick = (tacticalGame: TacticalGame) => {
    navigate(`/tactical/games/view/${tacticalGame.id}`, { state: { tacticalGame: tacticalGame } });
  };

  useEffect(() => {
    fetchGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <TacticalGameListActions />
      <Grid container spacing={2} mb={2} alignItems="center">
        <Grid size={12}>
          <Box display="flex" alignItems="center">
            <Typography variant="h6" color="primary" display="inline">
              {t('tactical-games')}
            </Typography>
            <IconButton onClick={handleNewGame} sx={{ ml: 1 }}>
              <AddCircleIcon />
            </IconButton>
          </Box>
        </Grid>
        <Grid size={12}>
          <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
            {games.map((game) => (
              <TacticalGameCard key={game.id} tacticalGame={game} onClick={() => onTacticalGameClick(game)} />
            ))}
          </Box>
          {games.length === 0 && <span>No games found.</span>}
        </Grid>
      </Grid>
    </>
  );
};

export default TacticalGameList;
