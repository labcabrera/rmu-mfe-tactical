import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import { factionColor } from '@labcabrera-rmu/rmu-react-shared-lib';
import type { GameSide } from '../api/tactical-game-sides.dto';
import { useCombatGame } from '../combat/combat-context';
import { allyFactionIdsOf, gameSides, sideLabel, sideOfFaction } from '../services/side-service';

export type SidesValue = {
  sides: GameSide[];
  sideOf: (factionId: string | undefined) => GameSide | undefined;
  /** Factions on the side of `factionId`, itself included. */
  allyFactionIds: (factionId: string | undefined) => string[];
  sameSide: (a: string | undefined, b: string | undefined) => boolean;
  sideLabel: (side: GameSide) => string;
  /** The colour of its first faction (spec 100, decision 9). */
  sideColor: (side: GameSide) => string;
};

/** Sides of the current combat (workspace spec 100): who is an ally, and how a side is named and coloured. */
export const useSides = (): SidesValue => {
  const theme = useTheme();
  const { game, factions } = useCombatGame();
  return useMemo(() => {
    const sides = gameSides(game);
    const factionName = (id: string) => factions?.find((faction) => faction.id === id)?.name ?? id;
    const allyFactionIds = (factionId: string | undefined) => allyFactionIdsOf(sides, factionId);
    return {
      sides,
      sideOf: (factionId) => sideOfFaction(sides, factionId),
      allyFactionIds,
      sameSide: (a, b) => a !== undefined && b !== undefined && allyFactionIds(a).includes(b),
      sideLabel: (side) => sideLabel(side, factionName),
      sideColor: (side) => factionColor(theme, game?.factions.indexOf(side.factionIds[0] ?? '') ?? -1),
    };
  }, [game, factions, theme]);
};
