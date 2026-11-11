import { describe, expect, it } from 'vitest';
import type { Action } from '../../../api/action.dto';
import type { ActorRound, ActorRoundAttack } from '../../../api/actor-rounds.dto';
import { attacksOnModify } from './useAttackDeclaration';

// Workspace spec 101: the form of a prepared attack that goes back to its targets and modifiers.
const weapon = (attackName: string, currentBo: number, type = 'melee') =>
  ({ attackName, currentBo, type }) as unknown as ActorRoundAttack;
const prepared = (attackName: string, targetId: string, bo: number, extra: object = {}) => ({
  attackName,
  protectors: ['beregond'],
  protectorPositions: { beregond: 'flank' },
  modifiers: { targetId, bo, positionalTarget: 'flank', cover: 'none', pace: 'walk', ...extra },
  roll: { roll: 87 },
  calculated: { rollTotal: 60 },
});
const actorWith = (attacks: ActorRoundAttack[], boReservations: object[] = []) =>
  ({ attacks, boReservations }) as unknown as ActorRound;
const actionWith = (patch: object) => ({ id: 'a1', status: 'pending_apply', ...patch }) as unknown as Action;

describe('attacksOnModify', () => {
  it('keeps the modifiers, protectors and OB of a weapon attack, without its roll, and adds the unused weapons', () => {
    const sword = weapon('sword', 0);
    const dagger = weapon('dagger', 20);
    const action = actionWith({ attacks: [prepared('sword', 'lurtz', 50)] });
    const attacks = attacksOnModify(
      action,
      actorWith([sword, dagger], [{ actionId: 'a1', kind: 'attack' }]),
      [sword, dagger],
      'melee',
      'none',
      undefined
    );

    expect(attacks).toHaveLength(2);
    expect(attacks[0]).toEqual({
      attackName: 'sword',
      protectors: ['beregond'],
      protectorPositions: { beregond: 'flank' },
      modifiers: expect.objectContaining({
        targetId: 'lurtz',
        bo: 50,
        positionalTarget: 'flank',
        pace: 'walk',
      }) as object,
    });
    expect(attacks[0]).not.toHaveProperty('roll');
    expect(attacks[1]).toMatchObject({ attackName: 'dagger', modifiers: { targetId: '', bo: 20, pace: 'walk' } });
  });

  it('lowers the OB to what the actor has left, and drops the target of a weapon left without OB', () => {
    const sword = weapon('sword', 30);
    const axe = weapon('axe', 0);
    const action = actionWith({ attacks: [prepared('sword', 'lurtz', 50), prepared('axe', 'ugluk', 20)] });
    const attacks = attacksOnModify(action, actorWith([sword, axe]), [sword, axe], 'melee', 'none', undefined);

    expect(attacks[0].modifiers).toMatchObject({ targetId: 'lurtz', bo: 30 });
    expect(attacks[1].modifiers).toMatchObject({ targetId: '', bo: 0 });
  });

  it('keeps every target of a spell attack and its OB as it was', () => {
    const ball = weapon('fire-ball', 40, 'ranged');
    const action = actionWith({
      actionType: 'cast_spell',
      attacks: [prepared('fire-ball', 'lurtz', 40), prepared('fire-ball', 'ugluk', 40)],
    });
    const attacks = attacksOnModify(action, actorWith([]), [ball], 'ranged', 'none', undefined);

    expect(attacks.map((attack) => attack.modifiers.targetId)).toEqual(['lurtz', 'ugluk']);
    expect(attacks.map((attack) => attack.modifiers.bo)).toEqual([40, 40]);
  });

  it('keeps the fixed OB and target of a stray shot and of a reaction', () => {
    const bow = weapon('bow', 60, 'ranged');
    const stray = actionWith({
      strayShot: { attackName: 'bow', targetActorId: 'beregond' },
      attacks: [prepared('bow', 'beregond', 0)],
    });
    expect(attacksOnModify(stray, actorWith([bow]), [bow], 'ranged', 'none', 0)[0].modifiers).toMatchObject({
      targetId: 'beregond',
      bo: 0,
    });
    const sword = weapon('sword', 0);
    const reaction = actionWith({
      reaction: { traitId: 'riposte', obOverride: 25 },
      attacks: [prepared('sword', 'lurtz', 25)],
    });
    expect(attacksOnModify(reaction, actorWith([sword]), [sword], 'melee', 'none', 25)[0].modifiers).toMatchObject({
      targetId: 'lurtz',
      bo: 25,
    });
  });
});
