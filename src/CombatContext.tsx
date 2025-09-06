import React, { createContext, useEffect, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Typography, Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { useError } from './ErrorContext';
import { fetchActionsByGameAndRound } from './modules/api/actions.js';
import { fetchActorRounds } from './modules/api/actor-rounds.js';
import { fetchCharacters } from './modules/api/characters.js';
import { fetchFactions } from './modules/api/factions';
import { fetchStrategicGame } from './modules/api/strategic-games.js';
import { fetchTacticalGame } from './modules/api/tactical-games.js';

type Game = {
  id: number;
  round: number;
  actors: { id: number }[];
  factions: number[];
  strategicGameId: number;
  [key: string]: any;
};

type StrategicGame = any;
type ActorRound = any;
type Character = any;
type Faction = any;
type RoundAction = { id: number; [key: string]: any };

type CombatContextType = {
  gameId: number | null;
  setGameId: Dispatch<SetStateAction<number | null>>;
  strategicGame: StrategicGame | null;
  setStrategicGame: Dispatch<SetStateAction<StrategicGame | null>>;
  game: Game | null;
  setGame: Dispatch<SetStateAction<Game | null>>;
  actorRounds: ActorRound[] | null;
  setActorRounds: Dispatch<SetStateAction<ActorRound[] | null>>;
  characters: Character[] | null;
  setCharacters: Dispatch<SetStateAction<Character[] | null>>;
  factions: Faction[] | null;
  setFactions: Dispatch<SetStateAction<Faction[] | null>>;
  roundActions: RoundAction[] | null;
  setRoundActions: Dispatch<SetStateAction<RoundAction[] | null>>;
  displayRound: number | null;
  setDisplayRound: Dispatch<SetStateAction<number | null>>;
  updateAction: (updatedAction: RoundAction) => void;
};

export const CombatContext = createContext<CombatContextType | undefined>(undefined);

type CombatProviderProps = {
  children: ReactNode;
};

export const CombatProvider: React.FC<CombatProviderProps> = ({ children }) => {
  const { showError } = useError();

  const [gameId, setGameId] = useState<number | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [strategicGame, setStrategicGame] = useState<StrategicGame | null>(null);
  const [actorRounds, setActorRounds] = useState<ActorRound[] | null>(null);
  const [characters, setCharacters] = useState<Character[] | null>(null);
  const [factions, setFactions] = useState<Faction[] | null>(null);
  const [roundActions, setRoundActions] = useState<RoundAction[] | null>(null);
  const [displayRound, setDisplayRound] = useState<number | null>(null);

  const bindGame = (gameId: number) => {
    fetchTacticalGame(gameId)
      .then((data: Game) => {
        setGame(data);
        setDisplayRound(data.round);
      })
      .catch((err: any) => {
        showError(err.message);
      });
  };

  const bindStrategicGame = (strategicGameId: number) => {
    fetchStrategicGame(strategicGameId)
      .then((data: StrategicGame) => {
        setStrategicGame(data);
      })
      .catch((err: any) => {
        showError(err.message);
      });
  };

  const bindActorRounds = (gameId: number, displayRound: number) => {
    fetchActorRounds(gameId, displayRound)
      .then((data: ActorRound[]) => {
        setActorRounds(data);
      })
      .catch((err: any) => {
        showError(err.message);
      });
  };

  const bindActions = (gameId: number, displayRound: number) => {
    fetchActionsByGameAndRound(gameId, displayRound)
      .then((data: RoundAction[]) => {
        setRoundActions(data);
      })
      .catch((err: any) => {
        showError(err.message);
      });
  };

  const bindCharacters = (game: Game) => {
    const characterIds = game.actors.map((e) => e.id);
    const rsql = `id=in=(${characterIds.join(',')})`;
    fetchCharacters(rsql, 0, 100)
      .then((data: Character[]) => {
        setCharacters(data);
      })
      .catch((err: any) => {
        showError(err.message);
      });
  };

  const bindFactions = (game: Game) => {
    const rsql = `id=in=(${game.factions.join(',')})`;
    fetchFactions(rsql, 0, 100)
      .then((data: Faction[]) => {
        setFactions(data);
      })
      .catch((err: any) => {
        showError(err.message);
      });
  };

  const updateAction = (updatedAction: RoundAction) => {
    setRoundActions((prevActions) =>
      prevActions ? prevActions.map((action) => (action.id === updatedAction.id ? updatedAction : action)) : prevActions
    );
  };

  useEffect(() => {
    console.log('CombatProvider.useEffect[game] triggered', game, displayRound);
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
    console.log('CombatProvider.useEffect[gameId] triggered', gameId);
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
