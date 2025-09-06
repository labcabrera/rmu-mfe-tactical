/* eslint-disable react/prop-types */
import React, { createContext, useEffect, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useError } from './ErrorContext.jsx';
import { fetchActionsByGameAndRound } from './modules/api/actions.js';
import { fetchActorRounds } from './modules/api/actor-rounds.js';
import { fetchCharacters } from './modules/api/characters.js';
import { fetchFactions } from './modules/api/factions';
import { fetchStrategicGame } from './modules/api/strategic-games.js';
import { fetchTacticalGame } from './modules/api/tactical-games.js';

export const CombatContext = createContext();

export const CombatProvider = ({ children }) => {
  const { showError } = useError();

  const [gameId, setGameId] = useState(null);
  const [game, setGame] = useState(null);
  const [strategicGame, setStrategicGame] = useState(null);
  const [actorRounds, setActorRounds] = useState(null);
  const [characters, setCharacters] = useState(null);
  const [factions, setFactions] = useState(null);
  const [roundActions, setRoundActions] = useState(null);
  const [displayRound, setDisplayRound] = useState(null);

  const bindGame = (gameId) => {
    fetchTacticalGame(gameId)
      .then((data) => {
        setGame(data);
        setDisplayRound(data.round);
      })
      .catch((err) => {
        showError(err.message);
      });
  };

  const bindStrategicGame = (strategicGameId) => {
    fetchStrategicGame(strategicGameId)
      .then((data) => {
        setStrategicGame(data);
      })
      .catch((err) => {
        showError(err.message);
      });
  };

  const bindActorRounds = (gameId, displayRound) => {
    console.log('CombatProvider.bindActorRounds', gameId, displayRound);
    fetchActorRounds(gameId, displayRound)
      .then((data) => {
        setActorRounds(data);
      })
      .catch((err) => {
        showError(err.message);
      });
  };

  const bindActions = (gameId, displayRound) => {
    fetchActionsByGameAndRound(gameId, displayRound)
      .then((data) => {
        setRoundActions(data);
      })
      .catch((err) => {
        showError(err.message);
      });
  };

  const bindCharacters = (game) => {
    const characterIds = game.actors.map((e) => e.id);
    const rsql = `id=in=(${characterIds.join(',')})`;
    try {
      fetchCharacters(rsql, 0, 100).then((data) => {
        setCharacters(data);
      });
    } catch (error) {
      console.error('CombatProvider.bindCharacters error: ' + error);
    }
  };

  const bindFactions = (game) => {
    const rsql = `id=in=(${game.factions.join(',')})`;
    fetchFactions(rsql, 0, 100)
      .then((data) => {
        setFactions(data);
      })
      .catch((err) => {
        showError(err.message);
      });
  };

  const updateAction = (updatedAction) => {
    setRoundActions((prevActions) => prevActions.map((action) => (action.id === updatedAction.id ? updatedAction : action)));
  };

  useEffect(() => {
    console.log('CombatProvider.useEffect[game] triggered', game, displayRound);
    if (game && displayRound) {
      bindActorRounds(game.id, displayRound);
      bindActions(game.id, displayRound);
    }
    if (game) {
      bindCharacters(game);
      bindFactions(game);
      bindStrategicGame(game.strategicGameId);
    }
  }, [game, displayRound]);

  useEffect(() => {
    console.log('CombatProvider.useEffect[gameId] triggered', gameId);
    if (gameId) {
      bindGame(gameId);
    }
  }, [gameId]);

  return (
    <>
      <CombatContext.Provider
        value={{
          gameId,
          setGameId,
          strategicGame,
          setStrategicGame,
          game,
          setGame,
          actorRounds,
          setActorRounds,
          characters,
          setCharacters,
          factions,
          setFactions,
          roundActions,
          setRoundActions,
          displayRound,
          setDisplayRound,
          updateAction,
        }}
      >
        {children}
      </CombatContext.Provider>

      <Box sx={{ mt: 100 }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
            <Typography component="span">Tactical game</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <pre>TacticalGame: {JSON.stringify(game, null, 2)}</pre>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
            <Typography component="span">Actor rounds</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <pre>actorRounds: {JSON.stringify(actorRounds, null, 2)}</pre>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
            <Typography component="span">Characters</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <pre>characters: {JSON.stringify(characters, null, 2)}</pre>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
            <Typography component="span">Round actions</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <pre>roundActions: {JSON.stringify(roundActions, null, 2)}</pre>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
            <Typography component="span">Strategic Game</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <pre>strategicGame: {JSON.stringify(strategicGame, null, 2)}</pre>
          </AccordionDetails>
        </Accordion>
        <pre>DisplayRound: {JSON.stringify(displayRound, null, 2)}</pre>
      </Box>
    </>
  );
};
