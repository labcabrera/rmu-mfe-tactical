import type { TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';

// Workspace spec 100: sides of a tactical game and its psychology rules. The lib type of the game does not have them
// yet, so they live here as the fields the API adds to `GameDto`.

/** `book`: fear by heads fallen (Table 14-3a); `house`: the triggers of the wiki, by levels. */
export type PsychologyRules = 'book' | 'house';

export const PSYCHOLOGY_RULES: PsychologyRules[] = ['house', 'book'];

/** A side groups factions that fight together. `name` null: the front names it with its factions. */
export type GameSide = {
  id: string;
  name: string | null;
  factionIds: string[];
  leaderActorId: string | null;
};

/** What the API adds to the game: `sides` are always the effective ones (one per faction when none is defined). */
export type TacticalGameSideFields = {
  sides?: GameSide[];
  sidesDefined?: boolean;
  psychologyRules?: PsychologyRules;
  version?: number;
};

export type TacticalGameWithSides = TacticalGame & TacticalGameSideFields;

/** `PUT v1/tactical-games/{id}/sides`; an empty list goes back to one side per faction. */
export type SetGameSidesDto = { sides: GameSide[]; version?: number };

/** `POST v1/tactical-games/{id}/fear-ease`: the actors whose balk and retreat were lifted. */
export type FearEaseResult = { actorIds: string[] };
