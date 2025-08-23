import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { fetchCharacters } from '../../api/characters';
import { fetchFactions } from '../../api/factions';
import { fetchStrategicGame } from '../../api/strategic-games';
import { fetchTacticalGame } from '../../api/tactical-games';
import TacticalGameViewActions from './TacticalGameViewActions';
import TacticalGameViewActors from './TacticalGameViewActors';
import TacticalGameViewInfo from './TacticalGameViewInfo';

const TacticalGameView = () => {
  const location = useLocation();
  const { gameId } = useParams();
  const [tacticalGame, setTacticalGame] = useState(null);
  const [strategicGame, setStrategicGame] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [factions, setFactions] = useState([]);

  const bindTacticalGame = async (gameId) => {
    const response = await fetchTacticalGame(gameId);
    setTacticalGame(response);
  };

  const bindStrategicGame = async (strategicGameId) => {
    console.log(`TacticalGameView.bindStrategicGame: ${strategicGameId}`);
    const response = await fetchStrategicGame(strategicGameId);
    setStrategicGame(response);
  };

  const bindCharacters = async (strategicGameId) => {
    const rsql = `gameId==${strategicGameId}`;
    const response = await fetchCharacters(rsql, 0, 100);
    setCharacters(response);
  };

  const bindFactions = async (strategicGameId) => {
    const rsql = `gameId==${strategicGameId}`;
    const response = await fetchFactions(rsql, 0, 100);
    setFactions(response);
  };

  useEffect(() => {
    if (location.state && location.state.tacticalGame) {
      setTacticalGame(location.state.tacticalGame);
    } else {
      bindTacticalGame(gameId);
    }
  }, [location.state]);

  useEffect(() => {
    if (tacticalGame && tacticalGame.strategicGameId) {
      bindStrategicGame(tacticalGame.strategicGameId);
      bindCharacters(tacticalGame.strategicGameId);
      bindFactions(tacticalGame.strategicGameId);
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
            <TacticalGameViewActors tacticalGame={tacticalGame} />
          </Grid>
        </Grid>
      </Box>
      <pre>Tactical: {JSON.stringify(tacticalGame, null, 2)}</pre>
      <pre>Strategic: {JSON.stringify(strategicGame, null, 2)}</pre>
      <pre>Factions: {JSON.stringify(factions, null, 2)}</pre>
      <pre>Characters: {JSON.stringify(characters, null, 2)}</pre>
    </>
  );
};

export default TacticalGameView;
