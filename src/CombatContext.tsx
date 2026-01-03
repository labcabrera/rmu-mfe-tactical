/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { createContext, useEffect, useState, ReactNode, Dispatch, SetStateAction, FC } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Typography, Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { useError } from './ErrorContext';
import { fetchActionsByGameAndRound } from './modules/api/action';
import { Action } from './modules/api/action.dto';
import { fetchActorRounds } from './modules/api/actor-rounds';
import { ActorRound } from './modules/api/actor-rounds.dto';
import { fetchCharacters } from './modules/api/characters';
import { Character } from './modules/api/characters.dto';
import { Faction, fetchFactions } from './modules/api/factions';
import { StrategicGame, fetchStrategicGame } from './modules/api/strategic-games';
import { TacticalGame, fetchTacticalGame } from './modules/api/tactical-games';

type CombatContextType = {
  gameId: string | null;
  setGameId: Dispatch<SetStateAction<string | null>>;
  strategicGame: StrategicGame | null;
  setStrategicGame: Dispatch<SetStateAction<StrategicGame | null>>;
  game: TacticalGame | null;
  setGame: Dispatch<SetStateAction<TacticalGame | null>>;
  actorRounds: ActorRound[] | null;
  setActorRounds: Dispatch<SetStateAction<ActorRound[] | null>>;
  characters: Character[] | null;
  setCharacters: Dispatch<SetStateAction<Character[] | null>>;
  factions: Faction[] | null;
  setFactions: Dispatch<SetStateAction<Faction[] | null>>;
  roundActions: Action[] | null;
  setRoundActions: Dispatch<SetStateAction<Action[] | null>>;
  displayRound: number | null;
  setDisplayRound: Dispatch<SetStateAction<number | null>>;
  updateAction: (updatedAction: Action) => void;
  updateActorRound: (updatedActorRound: ActorRound) => void;
  refreshActorRounds: () => void;
};

export const CombatContext = createContext<CombatContextType | undefined>(undefined);

export const CombatProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { showError } = useError();

  const [gameId, setGameId] = useState<string | null>(null);
  const [game, setGame] = useState<TacticalGame | null>(null);
  const [strategicGame, setStrategicGame] = useState<StrategicGame | null>(null);
  const [actorRounds, setActorRounds] = useState<ActorRound[] | null>(null);
  const [characters, setCharacters] = useState<Character[] | null>(null);
  const [factions, setFactions] = useState<Faction[] | null>(null);
  const [roundActions, setRoundActions] = useState<Action[] | null>(null);
  const [displayRound, setDisplayRound] = useState<number | null>(null);

  const bindGame = (gameId: string) => {
    fetchTacticalGame(gameId)
      .then((data: TacticalGame) => {
        setGame(data);
        setDisplayRound(data.round);
      })
      .catch((err) => showError(err.message));
  };

  const bindStrategicGame = (strategicGameId: string) => {
    fetchStrategicGame(strategicGameId)
      .then((data: StrategicGame) => setStrategicGame(data))
      .catch((err) => showError(err.message));
  };

  const bindActorRounds = (gameId: string, displayRound: number) => {
    fetchActorRounds(gameId, displayRound)
      .then((data) => {
        data.sort((a, b) => a.actorName.localeCompare(b.actorName));
        setActorRounds(data);
      })
      .catch((err) => showError(err.message));
  };

  const bindActions = (gameId: string, displayRound: number) => {
    fetchActionsByGameAndRound(gameId, displayRound)
      .then((data) => setRoundActions(data))
      .catch((err) => showError(err.message));
  };

  const bindCharacters = (game: TacticalGame) => {
    const characterIds = game.actors.map((e) => e.id);
    const rsql = `id=in=(${characterIds.join(',')})`;
    fetchCharacters(rsql, 0, 100)
      .then((data) => setCharacters(data))
      .catch((err) => showError(err.message));
  };

  const bindFactions = (game: TacticalGame) => {
    const rsql = `id=in=(${game.factions.join(',')})`;
    fetchFactions(rsql, 0, 100)
      .then((data) => setFactions(data))
      .catch((err) => showError(err.message));
  };

  const refreshActorRounds = () => {
    if (game && displayRound !== null) {
      bindActorRounds(game.id, displayRound);
    }
  };

  const updateAction = (updatedAction: Action) => {
    setRoundActions((prevActions) =>
      prevActions ? prevActions.map((action) => (action.id === updatedAction.id ? updatedAction : action)) : prevActions
    );
  };

  const updateActorRound = (updatedActorRound: ActorRound) => {
    setActorRounds((prevRounds) =>
      prevRounds
        ? prevRounds.map((round) => (round.id === updatedActorRound.id ? updatedActorRound : round))
        : prevRounds
    );
  };

  useEffect(() => {
    if (game && displayRound !== null) {
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
    if (gameId !== null) {
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
          updateActorRound,
          refreshActorRounds,
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
