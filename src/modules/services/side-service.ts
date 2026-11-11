import type { TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import type { GameSide, TacticalGameWithSides } from '../api/tactical-game-sides.dto';

// Workspace spec 100: sides of a tactical game. Every faction is in one side; another side is the enemy.

/** The sides of a game; an API without them gives one side per faction, as the API does with none defined. */
export const gameSides = (game: TacticalGame | null | undefined): GameSide[] => {
  if (!game) return [];
  const sides = (game as TacticalGameWithSides).sides;
  if (sides && sides.length > 0) return sides;
  return game.factions.map((factionId) => ({
    id: factionId,
    name: null,
    factionIds: [factionId],
    leaderActorId: null,
  }));
};

export const sideOfFaction = (sides: GameSide[], factionId: string | undefined): GameSide | undefined =>
  factionId === undefined ? undefined : sides.find((side) => side.factionIds.includes(factionId));

/** Factions on the side of `factionId`, itself included; only itself when no side has it. */
export const allyFactionIdsOf = (sides: GameSide[], factionId: string | undefined): string[] => {
  if (factionId === undefined) return [];
  return sideOfFaction(sides, factionId)?.factionIds ?? [factionId];
};

/** Its name, or the names of its factions joined. */
export const sideLabel = (side: GameSide, factionName: (factionId: string) => string): string =>
  side.name?.trim() || side.factionIds.map(factionName).join(' + ');

/** A side id not used yet (`/^[\w-]{1,64}$/`). */
export const newSideId = (sides: GameSide[]): string => {
  let index = sides.length + 1;
  while (sides.some((side) => side.id === `side-${index}`)) index += 1;
  return `side-${index}`;
};

/**
 * Moves a faction to a side (`null`: a new side of its own). A side left without factions is removed, and so is its
 * leader when it no longer belongs to the side (`leaderFaction` gives the faction of an actor).
 */
export const moveFaction = (
  sides: GameSide[],
  factionId: string,
  sideId: string | null,
  leaderFaction: (actorId: string) => string | undefined
): GameSide[] => {
  const targetId = sideId ?? newSideId(sides);
  const moved = sides.map((side) => ({
    ...side,
    factionIds:
      side.id === targetId
        ? [...side.factionIds.filter((id) => id !== factionId), factionId]
        : side.factionIds.filter((id) => id !== factionId),
  }));
  const withNew = sideId
    ? moved
    : [...moved, { id: targetId, name: null, factionIds: [factionId], leaderActorId: null }];
  return withNew
    .filter((side) => side.factionIds.length > 0)
    .map((side) => {
      const leaderFactionId = side.leaderActorId ? leaderFaction(side.leaderActorId) : undefined;
      return side.leaderActorId && (!leaderFactionId || !side.factionIds.includes(leaderFactionId))
        ? { ...side, leaderActorId: null }
        : side;
    });
};
