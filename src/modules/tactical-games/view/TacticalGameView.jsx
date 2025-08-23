import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { fetchStrategicGame } from '../../api/strategic-games';
import { fetchTacticalGame } from '../../api/tactical-games';
import TacticalGameViewActions from './TacticalGameViewActions';
import TacticalGameViewCharacters from './TacticalGameViewCharacters';
import TacticalGameViewInfo from './TacticalGameViewInfo';

const TacticalGameView = () => {
  const location = useLocation();
  const { gameId } = useParams();
  const [tacticalGame, setTacticalGame] = useState(null);
  const [strategicGame, setStrategicGame] = useState(null);

  const bindTacticalGame = async (gameId) => {
    const response = await fetchTacticalGame(gameId);
    setTacticalGame(response);
  };

  const bindStrategicGame = async (strategicGameId) => {
    console.log(`TacticalGameView.bindStrategicGame: ${strategicGameId}`);
    const response = await fetchStrategicGame(strategicGameId);
    setStrategicGame(response);
  };

  useEffect(() => {
    if (location.state && location.state.tacticalGame) {
      console.log(`TacticalGameView.useEffect: resolved tacticalGame from state`);
      setTacticalGame(location.state.tacticalGame);
    } else {
      console.log(`TacticalGameView.useEffect: fetch tacticalGame ${gameId} from API`);
      bindTacticalGame(gameId);
    }
  }, [location.state]);

  useEffect(() => {
    console.log('TacticalGameView.useEffect: tacticalGame ', tacticalGame);
    if (tacticalGame && tacticalGame.strategicGameId) {
      bindStrategicGame(tacticalGame.strategicGameId);
    }
  }, [tacticalGame]);

  if (!tacticalGame) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <TacticalGameViewActions tacticalGame={tacticalGame} />
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid item size={4}>
            <TacticalGameViewInfo tacticalGame={tacticalGame} strategicGame={strategicGame} />
          </Grid>
          <Grid item size={4}>
            <TacticalGameViewCharacters tacticalGame={tacticalGame} />
          </Grid>
        </Grid>
      </Box>
      <pre>Tactical: {JSON.stringify(tacticalGame, null, 2)}</pre>
      <pre>Strategic: {JSON.stringify(strategicGame, null, 2)}</pre>
    </>
  );
};

export default TacticalGameView;
