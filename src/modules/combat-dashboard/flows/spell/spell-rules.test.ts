import { describe, expect, it } from 'vitest';
import { ActionSpell } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import { boltMaxTargets, failurePowerPoints, recycledPowerPoints, spellSourceAttacks } from './spell-rules';

const spell = (patch: object = {}): ActionSpell => patch as unknown as ActionSpell;
const actor = (tier?: number): ActorRound =>
  ({ traits: tier ? [{ traitId: 'power-recycling', tier }] : [] }) as unknown as ActorRound;

describe('failurePowerPoints', () => {
  it.each([
    ['none', 7, 20, 0],
    ['one', 7, 20, 1],
    ['half-down', 7, 20, 3],
    ['half-up', 7, 20, 4],
    ['normal', 7, 20, 7],
    ['double', 7, 20, 14],
    ['triple', 7, 20, 20],
    ['all', 7, 20, 20],
  ] as const)('%s of a spell of %i with %i left is %i', (kind, spellPp, current, expected) => {
    expect(failurePowerPoints(kind, spellPp, current)).toBe(expected);
  });

  it('never takes more than the caster has', () => {
    expect(failurePowerPoints('double', 10, 5)).toBe(5);
    expect(failurePowerPoints('all', 10, 0)).toBe(0);
  });
});

describe('boltMaxTargets', () => {
  it('is 1 for anything but a bolt', () => {
    expect(boltMaxTargets(spell({ attack: { kind: 'ball', maxTargets: 4 } }))).toBe(1);
    expect(boltMaxTargets(spell())).toBe(1);
  });

  it('reads the targets of a bolt, at least 1', () => {
    expect(boltMaxTargets(spell({ attack: { kind: 'bolt', maxTargets: 3 } }))).toBe(3);
    expect(boltMaxTargets(spell({ attack: { kind: 'bolt', maxTargets: 0 } }))).toBe(1);
    expect(boltMaxTargets(spell({ attack: { kind: 'bolt' } }))).toBe(1);
  });
});

describe('recycledPowerPoints', () => {
  it('gives nothing back without the talent or on a success', () => {
    expect(recycledPowerPoints(actor(), spell({ result: 'failure' }), 9)).toBe(0);
    expect(recycledPowerPoints(actor(1), spell({ result: 'success' }), 9)).toBe(0);
  });

  it('saves half, rounded for the caster, at tier 1', () => {
    expect(recycledPowerPoints(actor(1), spell({ result: 'failure' }), 9)).toBe(5);
    expect(recycledPowerPoints(actor(1), spell({ result: 'no-effect' }), 8)).toBe(4);
  });

  it('saves everything at tier 2', () => {
    expect(recycledPowerPoints(actor(2), spell({ result: 'failure' }), 9)).toBe(9);
  });

  it('never saves a negative amount', () => {
    expect(recycledPowerPoints(actor(1), spell({ result: 'failure' }), -3)).toBe(0);
  });
});

describe('spellSourceAttacks', () => {
  const attack = { kind: 'ball', attackName: 'fire-ball', bo: 30, attackTable: 't', fumbleTable: 'f', fumble: 2 };

  it('makes a ball attack every other actor, numbered', () => {
    const attacks = spellSourceAttacks(spell({ attack }), 3);
    expect(attacks.map((a) => a.attackName)).toEqual(['fire-ball-1', 'fire-ball-2', 'fire-ball-3']);
    expect(attacks[0]).toMatchObject({ baseBo: 30, currentBo: 30, type: 'ranged', canThrow: false });
  });

  it('keeps one attack even with nobody else in the round', () => {
    expect(spellSourceAttacks(spell({ attack }), 0)).toHaveLength(1);
  });

  it('keeps the plain name of a single bolt', () => {
    const bolt = { ...attack, kind: 'bolt', attackName: 'shock-bolt' };
    expect(spellSourceAttacks(spell({ attack: bolt }), 5).map((a) => a.attackName)).toEqual(['shock-bolt']);
  });

  it('numbers a bolt with several targets, up to the actors there are', () => {
    const bolt = { ...attack, kind: 'bolt', attackName: 'shock-bolt', maxTargets: 3 };
    expect(spellSourceAttacks(spell({ attack: bolt }), 2).map((a) => a.attackName)).toEqual([
      'shock-bolt-1',
      'shock-bolt-2',
    ]);
  });
});
