/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { createContext, useEffect, useState, ReactNode, Dispatch, SetStateAction, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Typography, Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import {
  Character,
  ENVIRONMENT_FACTION_ID,
  environmentFactionName,
  Faction,
  fetchCharacters,
  fetchFactions,
  fetchNpcs,
  Npc,
  fetchStrategicGame,
  fetchTacticalGame,
  StrategicGame,
  TacticalGame,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { fetchActionsByGameAndRound } from './modules/api/action';
import { Action } from './modules/api/action.dto';
import { fetchActorRounds } from './modules/api/actor-rounds';
import { ActorRound } from './modules/api/actor-rounds.dto';

type RoundActorSort = 'name' | 'initiative';

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
  /** NPCs the NPC actors come from (spec 055), for their image, category and stat block. */
  npcs: Npc[] | null;
  roundActions: Action[] | null;
  setRoundActions: Dispatch<SetStateAction<Action[] | null>>;
  displayRound: number | null;
  setDisplayRound: Dispatch<SetStateAction<number | null>>;
  roundActorSort: RoundActorSort;
  setRoundActorSort: Dispatch<SetStateAction<RoundActorSort>>;
  updateAction: (updatedAction: Action) => void;
  updateActorRound: (updatedActorRound: ActorRound) => void;
  refreshActorRounds: () => void;
};

// Debug panel with the raw combat state, enabled with localStorage.setItem('rmu-debug', 'true').
const isDebugEnabled = (): boolean => {
  try {
    return localStorage.getItem('rmu-debug') === 'true';
  } catch {
    return false;
  }
};

export const CombatContext = createContext<CombatContextType | undefined>(undefined);

export const CombatProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useNotify();

  const [gameId, setGameId] = useState<string | null>(null);
  const [game, setGame] = useState<TacticalGame | null>(null);
  const [strategicGame, setStrategicGame] = useState<StrategicGame | null>(null);
  const [actorRounds, setActorRounds] = useState<ActorRound[] | null>(null);
  const [characters, setCharacters] = useState<Character[] | null>(null);
  const [factions, setFactions] = useState<Faction[] | null>(null);
  const [npcs, setNpcs] = useState<Npc[] | null>(null);
  const [roundActions, setRoundActions] = useState<Action[] | null>(null);
  const [displayRound, setDisplayRound] = useState<number | null>(null);
  const [roundActorSort, setRoundActorSort] = useState<RoundActorSort>('name');

  const bindGame = (gameId: string) => {
    fetchTacticalGame(gameId, auth)
      .then((data: TacticalGame) => {
        setGame(data);
        setDisplayRound(data.round);
      })
      .catch((err) => notify.error(err));
  };

  const bindStrategicGame = (strategicGameId: string) => {
    fetchStrategicGame(strategicGameId, auth)
      .then((data: StrategicGame) => setStrategicGame(data))
      .catch((err) => notify.error(err));
  };

  const bindActorRounds = (gameId: string, displayRound: number) => {
    fetchActorRounds(gameId, displayRound, auth)
      .then((data) => data.content)
      .then((data) => {
        if (roundActorSort === 'name') {
          data.sort((a, b) => a.actorName.localeCompare(b.actorName));
        } else if (roundActorSort === 'initiative') {
          data.sort((a, b) => (b.initiative.total || 0) - (a.initiative.total || 0));
        }
        setActorRounds(data);
      })
      .catch((err) => notify.error(err));
  };

  const bindActions = (gameId: string, displayRound: number) => {
    fetchActionsByGameAndRound(gameId, displayRound, auth)
      .then((data) => setRoundActions(data))
      .catch((err) => notify.error(err));
  };

  const bindCharacters = (game: TacticalGame) => {
    const characterIds = game.actors.filter((actor) => actor.type !== 'npc').map((e) => e.id);
    if (characterIds.length === 0) {
      setCharacters([]);
      return;
    }
    const rsql = `id=in=(${characterIds.join(',')})`;
    fetchCharacters(rsql, 0, 100, auth)
      .then((data) => setCharacters(data.content))
      .catch((err) => notify.error(err));
  };

  const bindNpcs = (game: TacticalGame) => {
    const npcIds = [...new Set(game.actors.map((actor) => actor.npcId).filter((id): id is string => !!id))];
    if (npcIds.length === 0) {
      setNpcs([]);
      return;
    }
    fetchNpcs(`id=in=(${npcIds.join(',')})`, 0, 100, auth)
      .then((data) => setNpcs(data.content))
      .catch((err) => notify.error(err));
  };

  // The environment (spec 055) is not a strategic faction: it is added here, so the board treats it as any other.
  const bindFactions = (game: TacticalGame) => {
    const environment: Faction[] = game.factions.includes(ENVIRONMENT_FACTION_ID)
      ? [
          {
            id: ENVIRONMENT_FACTION_ID,
            gameId: game.strategicGameId,
            name: environmentFactionName(game.environmentFaction?.name, t),
            management: { availableGold: 0 },
          },
        ]
      : [];
    const strategicIds = game.factions.filter((id) => id !== ENVIRONMENT_FACTION_ID);
    if (strategicIds.length === 0) {
      setFactions(environment);
      return;
    }
    const rsql = `id=in=(${strategicIds.join(',')})`;
    fetchFactions(rsql, 0, 100, auth)
      .then((data) => setFactions([...data.content, ...environment]))
      .catch((err) => notify.error(err));
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

  // Rounds and actions follow the displayed round; characters, factions and the strategic game only change
  // with the game. Sorting is done in memory (below) and refetches nothing.
  useEffect(() => {
    if (game && displayRound !== null) {
      bindActorRounds(game.id, displayRound);
      bindActions(game.id, displayRound);
    }
  }, [game, displayRound]);

  useEffect(() => {
    if (game) {
      bindCharacters(game);
      bindNpcs(game);
      bindFactions(game);
      bindStrategicGame(game.strategicGameId);
    }
  }, [game?.id]);

  useEffect(() => {
    if (gameId !== null) {
      bindGame(gameId);
    }
  }, [gameId]);

  useEffect(() => {
    if (!actorRounds) return;
    const sorted = [...actorRounds];
    if (roundActorSort === 'name') {
      sorted.sort((a, b) => a.actorName.localeCompare(b.actorName));
    } else {
      sorted.sort((a, b) => (b.initiative?.total ?? 0) - (a.initiative?.total ?? 0));
    }
    const sameOrder = sorted.length === actorRounds.length && sorted.every((r, i) => r.id === actorRounds[i]?.id);
    if (!sameOrder) {
      setActorRounds(sorted);
    }
  }, [roundActorSort, actorRounds]);

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
          npcs,
          roundActions,
          setRoundActions,
          displayRound,
          setDisplayRound,
          roundActorSort,
          setRoundActorSort,
          updateAction,
          updateActorRound,
          refreshActorRounds,
        }}
      >
        {children}
      </CombatContext.Provider>

      {isDebugEnabled() && (
        <Box sx={{ mt: 4 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
              <Typography component="span">{t('tactical-game')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <pre>{JSON.stringify(game, null, 2)}</pre>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
              <Typography component="span">{t('actor-rounds')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <pre>{JSON.stringify(actorRounds, null, 2)}</pre>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
              <Typography component="span">{t('characters')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <pre>{JSON.stringify(characters, null, 2)}</pre>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
              <Typography component="span">{t('round-actions')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <pre>{JSON.stringify(roundActions, null, 2)}</pre>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
              <Typography component="span">{t('strategic-game')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <pre>{JSON.stringify(strategicGame, null, 2)}</pre>
            </AccordionDetails>
          </Accordion>
          <pre>{JSON.stringify({ displayRound }, null, 2)}</pre>
        </Box>
      )}
    </>
  );
};
