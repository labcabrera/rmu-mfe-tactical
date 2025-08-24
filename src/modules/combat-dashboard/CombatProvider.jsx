import React, { createContext, use, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { fetchActorRounds } from '../api/actor-rounds';
import { fetchCharacters } from '../api/characters';
import { fetchTacticalGame } from '../api/tactical-games';
import SnackbarError from '../shared/errors/SnackbarError';

export const CombatContext = createContext();

export const CombatProvider = ({ children }) => {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [actorRounds, setActorRounds] = useState(null);
  const [characters, setCharacters] = useState(null);
  const [roundActions, setRoundActions] = useState([]);
  const [displayRound, setDisplayRound] = useState(null);
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const bindGame = (gameId) => {
    try {
      fetchTacticalGame(gameId).then((data) => {
        setGame(data);
        setDisplayRound(data.round);
      });
    } catch (error) {
      console.error('CombatProvider.bindGame error: ' + error);
    }
  };

  const bindActorRounds = (gameId, displayRound) => {
    try {
      fetchActorRounds(gameId, displayRound).then((data) => {
        setActorRounds(data);
      });
    } catch (error) {
      console.error('CombatProvider.bindActors error: ' + error);
    }
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

  useEffect(() => {
    console.log('CombatProvider.useEffect[gameId] triggered', gameId);
    if (gameId) {
      bindGame(gameId);
    }
  }, [gameId]);

  useEffect(() => {
    console.log('CombatProvider.useEffect[game] triggered', game, displayRound);
    if (game && displayRound) {
      bindActorRounds(game.id, displayRound);
    }
    if (game) {
      bindCharacters(game);
    }
  }, [game, displayRound]);

  return (
    <>
      <CombatContext.Provider
        value={{
          gameId,
          game,
          setGame,
          actorRounds,
          setActorRounds,
          characters,
          setCharacters,
          roundActions,
          setRoundActions,
          displayRound,
          setDisplayRound,
        }}
      >
        {children}
      </CombatContext.Provider>

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
      <pre>DisplayRound: {JSON.stringify(displayRound, null, 2)}</pre>
      <SnackbarError errorMessage={errorMessage} displayError={displayError} setDisplayError={setDisplayError} />
    </>
  );
};
