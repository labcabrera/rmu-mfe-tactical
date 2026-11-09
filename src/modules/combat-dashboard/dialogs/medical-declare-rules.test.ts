import { describe, expect, it } from 'vitest';
import type { ActorRound } from '../../api/actor-rounds.dto';
import { defaultProcedure, targetKey, targetsOf } from './medical-declare-rules';

const actor = (patch: object): ActorRound => patch as unknown as ActorRound;

describe('targetsOf', () => {
  it('is empty without an actor', () => {
    expect(targetsOf(undefined)).toEqual([]);
  });

  it('puts dying effects first, then the injuries still open, the ones that bleed first', () => {
    const targets = targetsOf(
      actor({
        effects: [
          { id: 'e1', status: 'dying' },
          { id: 'e2', status: 'stunned' },
        ],
        injuries: [
          { id: 'i1', status: 'open', bleeding: 1 },
          { id: 'i2', status: 'healed', bleeding: 9 },
          { id: 'i3', status: 'open', poison: true, bleeding: 9 },
          { id: 'i4', status: 'open', bleeding: 3 },
        ],
      })
    );
    expect(targets.map(targetKey)).toEqual(['dying:e1', 'injury:i4', 'injury:i1']);
  });
});

describe('defaultProcedure', () => {
  it('stabilizes the dying, presses what bleeds and dresses the rest', () => {
    expect(defaultProcedure({ kind: 'dying', effect: { id: 'e' } as never })).toBe('stabilize');
    expect(defaultProcedure({ kind: 'injury', injury: { bleeding: 2 } as never })).toBe('pressure');
    expect(defaultProcedure({ kind: 'injury', injury: {} as never })).toBe('dress');
    expect(defaultProcedure(undefined)).toBe('dress');
  });
});
