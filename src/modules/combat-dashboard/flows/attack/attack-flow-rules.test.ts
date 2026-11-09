import { describe, expect, it } from 'vitest';
import type { Action } from '../../../api/action.dto';
import type { ActorRound } from '../../../api/actor-rounds.dto';
import { attackChangeable, stepOf } from './attack-flow-rules';

const action = (patch: object): Action => patch as unknown as Action;
const actor = (patch: object): ActorRound =>
  ({ attacks: [{ attackName: 'sword', currentBo: 40 }], parries: [{}], ...patch }) as unknown as ActorRound;

describe('stepOf', () => {
  it('follows the local step before the attack is prepared', () => {
    expect(stepOf(action({ status: 'declared' }), true, 1)).toBe(1);
    expect(stepOf(action({ status: 'held' }), false, 0)).toBe(0);
  });

  it('keeps a spell local until its attacks exist', () => {
    expect(stepOf(action({ status: 'pending_apply', actionType: 'cast_spell' }), false, 1)).toBe(1);
    expect(stepOf(action({ status: 'pending_apply', actionType: 'cast_spell', attacks: [{}] }), false, 1)).toBe(2);
  });

  it('places the parry and the result by the status of the action', () => {
    expect(stepOf(action({ status: 'parry' }), true, 0)).toBe(2);
    expect(stepOf(action({ status: 'pending_roll' }), true, 0)).toBe(3);
    expect(stepOf(action({ status: 'pending_roll' }), false, 0)).toBe(2);
    expect(stepOf(action({ status: 'completed' }), true, 0)).toBe(4);
    expect(stepOf(action({ status: 'completed' }), false, 0)).toBe(3);
  });
});

describe('attackChangeable', () => {
  const attack = (bo: number, roll?: number) => ({ attackName: 'sword', modifiers: { bo }, roll: { roll } });

  it('allows going back while an attack not rolled is at the OB left', () => {
    expect(attackChangeable(action({ status: 'parry', attacks: [attack(40)] }), actor({}), true)).toBe(true);
  });

  it('refuses when the attack does not spend the OB of the round or is in another status', () => {
    expect(attackChangeable(action({ status: 'parry', attacks: [attack(40)] }), actor({}), false)).toBe(false);
    expect(attackChangeable(action({ status: 'completed', attacks: [attack(40)] }), actor({}), true)).toBe(false);
  });

  it('needs a parry or a reservation of OB on the actor', () => {
    const noParry = actor({ parries: [] });
    expect(attackChangeable(action({ status: 'parry', attacks: [attack(40)] }), noParry, true)).toBe(false);
    const reserved = actor({ parries: [], boReservations: [{}] });
    expect(attackChangeable(action({ status: 'parry', attacks: [attack(40)] }), reserved, true)).toBe(true);
  });

  it('ignores attacks already rolled or below the OB left', () => {
    expect(attackChangeable(action({ status: 'parry', attacks: [attack(40, 77)] }), actor({}), true)).toBe(false);
    expect(attackChangeable(action({ status: 'parry', attacks: [attack(30)] }), actor({}), true)).toBe(false);
  });
});
