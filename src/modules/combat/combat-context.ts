import { createContext, Dispatch, SetStateAction, useContext } from 'react';
import { Character, Faction, Npc, StrategicGame, TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { Action } from '../api/action.dto';
import { ActorRound } from '../api/actor-rounds.dto';

export type RoundActorSort = 'name' | 'initiative';

/** The game and what comes with it: changes only when the game, its roster or its strategic game do. */
export type CombatGameValue = {
  gameId: string | null;
  strategicGame: StrategicGame | null;
  game: TacticalGame | null;
  characters: Character[] | null;
  factions: Faction[] | null;
  /** NPCs the NPC actors come from (spec 055), for their image, category and stat block. */
  npcs: Npc[] | null;
  /** The error that keeps the board from showing anything, if any. */
  loadError: unknown;
};

/** The data of the displayed round. */
export type CombatRoundValue = {
  actorRounds: ActorRound[] | null;
  roundActions: Action[] | null;
  displayRound: number | null;
  roundActorSort: RoundActorSort;
};

/** What changes the combat. Stable while the displayed game and round are the same. */
export type CombatActionsValue = {
  setGameId: Dispatch<SetStateAction<string | null>>;
  setGame: Dispatch<SetStateAction<TacticalGame | null>>;
  setActorRounds: Dispatch<SetStateAction<ActorRound[] | null>>;
  setCharacters: Dispatch<SetStateAction<Character[] | null>>;
  setRoundActions: Dispatch<SetStateAction<Action[] | null>>;
  setDisplayRound: Dispatch<SetStateAction<number | null>>;
  setRoundActorSort: Dispatch<SetStateAction<RoundActorSort>>;
  updateAction: (updatedAction: Action) => void;
  updateActorRound: (updatedActorRound: ActorRound) => void;
  refreshActorRounds: () => void;
  /** The actor rounds and the actions of the displayed round: an action can change the others (workspace spec 083). */
  refreshRound: () => void;
  /** Loads again everything of the combat: game, round, characters, NPCs and factions. */
  reloadCombat: () => void;
};

export const CombatGameContext = createContext<CombatGameValue | undefined>(undefined);
export const CombatRoundContext = createContext<CombatRoundValue | undefined>(undefined);
export const CombatActionsContext = createContext<CombatActionsValue | undefined>(undefined);

const required = <T>(value: T | undefined, name: string): T => {
  if (value === undefined) throw new Error(`${name} must be used inside CombatProvider`);
  return value;
};

export const useCombatGame = (): CombatGameValue => required(useContext(CombatGameContext), 'useCombatGame');
export const useCombatRound = (): CombatRoundValue => required(useContext(CombatRoundContext), 'useCombatRound');
export const useCombatActions = (): CombatActionsValue =>
  required(useContext(CombatActionsContext), 'useCombatActions');
