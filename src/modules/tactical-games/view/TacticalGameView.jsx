import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { fetchCharacters } from '../../api/characters';
import { fetchFactions } from '../../api/factions';
import { fetchStrategicGame } from '../../api/strategic-games';
import { fetchTacticalGame } from '../../api/tactical-games';
import TacticalGameViewActions from './TacticalGameViewActions';
import TacticalGameViewActors from './TacticalGameViewActors';
import TacticalGameViewFactions from './TacticalGameViewFactions';
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

  const bindCharacters = async (factions) => {
    if (factions.length > 0) {
      const rsql = `factionId=in=(${factions.join(',')})`;
      const response = await fetchCharacters(rsql, 0, 100);
      setCharacters(response);
    } else {
      setCharacters([]);
    }
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
      bindFactions(tacticalGame.strategicGameId);
    }
    if (tacticalGame && tacticalGame.factions) {
      bindCharacters(tacticalGame.factions);
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
            <TacticalGameViewFactions tacticalGame={tacticalGame} setTacticalGame={setTacticalGame} factions={factions} />
          </Grid>
          <Grid item size={4}>
            <TacticalGameViewActors tacticalGame={tacticalGame} setTacticalGame={setTacticalGame} factions={factions} characters={characters} />
          </Grid>
        </Grid>
      </Box>

      <Typography component="h2" color="primary">
        Debug Info
      </Typography>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
          <Typography component="span">Tactical Game</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <pre>Tactical: {JSON.stringify(tacticalGame, null, 2)}</pre>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
          <Typography component="span">Strategic Game</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <pre>Strategic: {JSON.stringify(strategicGame, null, 2)}</pre>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
          <Typography component="span">Factions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <pre>Factions: {JSON.stringify(factions, null, 2)}</pre>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
          <Typography component="span">Characters</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <pre>Characters: {JSON.stringify(characters, null, 2)}</pre>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default TacticalGameView;
