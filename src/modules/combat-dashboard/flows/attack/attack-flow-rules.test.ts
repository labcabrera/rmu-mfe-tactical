import { describe, expect, it } from 'vitest';
import type { Action } from '../../../api/action.dto';
import type { ActorRound } from '../../../api/actor-rounds.dto';
import { canModifyAttack, isModifyLossEmpty, lostOnModify, obOnModify, stepOf } from './attack-flow-rules';

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

describe('canModifyAttack (workspace spec 101)', () => {
  const attacks = [{ attackName: 'sword', modifiers: { bo: 40 } }];

  it('allows going back from any status before the attack is applied', () => {
    for (const status of ['prepared', 'parry', 'pending_roll', 'pending_apply']) {
      expect(canModifyAttack(action({ status, attacks }))).toBe(true);
    }
  });

  it('refuses before the attack is prepared and once it is applied', () => {
    expect(canModifyAttack(action({ status: 'declared', attacks: [] }))).toBe(false);
    expect(canModifyAttack(action({ status: 'completed', attacks }))).toBe(false);
  });

  it('allows the attack of a spell only while the cast is not applied', () => {
    const spell = (powerPointsSpent: number | null) =>
      action({ status: 'pending_roll', actionType: 'cast_spell', attacks, spell: { powerPointsSpent } });
    expect(canModifyAttack(spell(null))).toBe(true);
    expect(canModifyAttack(spell(6))).toBe(false);
  });
});

describe('lostOnModify (workspace spec 101)', () => {
  const rounds = [{ actorId: 'eradan', actorName: 'Eradan' }] as unknown as ActorRound[];

  it('is empty for a prepared attack without parries nor rolls', () => {
    const loss = lostOnModify(
      action({ parries: [{ actorId: 'eradan', parry: 0 }], attacks: [{ attackName: 'sword', roll: {} }] }),
      rounds
    );
    expect(isModifyLossEmpty(loss)).toBe(true);
  });

  it('lists the parries declared, the shield maneuvers resolved and the rolls sent', () => {
    const loss = lostOnModify(
      action({
        parries: [
          { actorId: 'eradan', parry: 30 },
          { actorId: 'eradan', parry: 20, carriedOver: true },
        ],
        attacks: [
          {
            attackName: 'sword',
            shieldManeuver: { required: true, passed: false },
            roll: { roll: 87, criticalRolls: { 'S-B': 45 }, fumbleRoll: null },
          },
          { attackName: 'dagger', roll: { roll: null } },
        ],
      }),
      rounds
    );
    expect(loss.parries).toEqual([{ actorId: 'eradan', actorName: 'Eradan', parry: 30 }]);
    expect(loss.shieldManeuvers).toBe(1);
    expect(loss.rolls).toEqual([{ attackName: 'sword', kinds: ['attack', 'critical'] }]);
    expect(isModifyLossEmpty(loss)).toBe(false);
  });
});

describe('obOnModify (workspace spec 101)', () => {
  it('keeps the OB while the action holds it reserved', () => {
    const reserved = actor({
      attacks: [{ attackName: 'sword', currentBo: 0 }],
      boReservations: [{ actionId: 'a1', kind: 'attack' }],
    });
    expect(obOnModify(action({ id: 'a1' }), reserved, 'sword', 50)).toBe(50);
  });

  it('lowers it to what the actor has left otherwise (spec 082)', () => {
    const lowered = actor({
      attacks: [{ attackName: 'sword', currentBo: 30 }],
      boReservations: [{ actionId: 'other', kind: 'attack' }],
    });
    expect(obOnModify(action({ id: 'a1' }), lowered, 'sword', 50)).toBe(30);
    expect(obOnModify(action({ id: 'a1' }), lowered, 'sword', 20)).toBe(20);
  });
});
