import type { TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { describe, expect, it } from 'vitest';
import type { GameSide } from '../api/tactical-game-sides.dto';
import { allyFactionIdsOf, gameSides, moveFaction, sideLabel } from './side-service';

const side = (id: string, factionIds: string[], leaderActorId: string | null = null): GameSide => ({
  id,
  name: null,
  factionIds,
  leaderActorId,
});

describe('side-service', () => {
  it('gives one side per faction when the game has none', () => {
    const game = { factions: ['a', 'b'] } as unknown as TacticalGame;
    expect(gameSides(game).map((each) => each.factionIds)).toEqual([['a'], ['b']]);
  });

  it('finds the allies of a faction', () => {
    const sides = [side('s1', ['a', 'b']), side('s2', ['c'])];
    expect(allyFactionIdsOf(sides, 'b')).toEqual(['a', 'b']);
    expect(allyFactionIdsOf(sides, 'x')).toEqual(['x']);
  });

  it('labels a side without name with its factions', () => {
    expect(sideLabel(side('s1', ['a', 'b']), (id) => id.toUpperCase())).toBe('A + B');
  });

  it('moves a faction, drops empty sides and a leader left outside', () => {
    const sides = [side('s1', ['a'], 'actor-a'), side('s2', ['b'])];
    const moved = moveFaction(sides, 'a', 's2', () => 'a');
    expect(moved).toEqual([{ ...side('s2', ['b', 'a']) }]);
    const split = moveFaction([side('s1', ['a', 'b'], 'actor-b')], 'b', null, () => 'b');
    expect(split).toEqual([side('s1', ['a']), side('side-2', ['b'])]);
  });
});
