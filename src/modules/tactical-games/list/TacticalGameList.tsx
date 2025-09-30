import React, { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Box, Grid, IconButton, Typography } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { fetchTacticalGames } from '../../api/tactical-games';
import type { TacticalGame } from '../../api/tactical-games';
import AddButton from '../../shared/buttons/AddButton';
import TacticalGameCard from '../../shared/cards/TacticalGameCard';
import TacticalGameListActions from './TacticalGameListActions';
import TacticalGameResume from './TacticalGameResume';

const TacticalGameList: FC = () => {
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
    fetchTacticalGames('', 0, 20)
      .then((response) => setGames(response))
      .catch((err) => showError(err.message));
  }, [showError]);

  return (
    <>
      <TacticalGameListActions />
      <Grid container spacing={2}>
        <Grid size={2}>
          <TacticalGameResume />
        </Grid>
        <Grid size={10}>
          <Box display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
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
