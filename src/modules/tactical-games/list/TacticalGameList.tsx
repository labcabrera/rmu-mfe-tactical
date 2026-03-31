import React, { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid } from '@mui/material';
import { RmuTextCard } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { fetchTacticalGames } from '../../api/tactical-game';
import { TacticalGame } from '../../api/tactical-game.dto';
import { gridSizeResume, gridSizeMain, gridSizeCard } from '../../services/display';
import { defaultImage } from '../../services/image-service';
import TacticalGameListActions from './TacticalGameListActions';
import TacticalGameResume from './TacticalGameResume';

const TacticalGameList: FC = () => {
  const navigate = useNavigate();
  const { showError } = useError();
  const [games, setGames] = useState<TacticalGame[]>([]);

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
      <Grid container spacing={1}>
        <Grid size={gridSizeResume}>
          <TacticalGameResume />
        </Grid>
        <Grid size={gridSizeMain}>
          <Grid container spacing={1}>
            {games.map((game, index) => (
              <Grid size={gridSizeCard} key={index}>
                <RmuTextCard
                  value={game.name}
                  subtitle={game.description}
                  image={defaultImage}
                  onClick={() => onTacticalGameClick(game)}
                />
              </Grid>
            ))}
          </Grid>
          {games.length === 0 && <span>No games found.</span>}
        </Grid>
      </Grid>
    </>
  );
};

export default TacticalGameList;
