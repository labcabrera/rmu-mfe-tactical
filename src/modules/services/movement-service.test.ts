import { describe, expect, it } from 'vitest';
import type { Action } from '../api/action.dto';
import type { ActorRound } from '../api/actor-rounds.dto';
import { chargeFor } from './movement-service';

const actor = (bmr = 20): ActorRound => ({ actorId: 'a', movement: { bmr } }) as unknown as ActorRound;
const movement = (distance: number, patch: object = {}): Action =>
  ({
    id: `m-${distance}`,
    actorId: 'a',
    round: 1,
    actionType: 'movement',
    status: 'completed',
    phaseStart: 1,
    movement: { calculated: { distance } },
    ...patch,
  }) as unknown as Action;

describe('chargeFor', () => {
  it('gives no charge up to twice the BMR', () => {
    expect(chargeFor(actor(), [movement(40)], 1).speed).toBe('none');
  });

  it('gives one size over twice the BMR, at run pace as in the example of Hildrikki', () => {
    const charge = chargeFor(actor(), [movement(45), movement(5, { id: 'm-2' })], 1);
    expect(charge).toEqual({ speed: 'jog', moved: 50, bmr: 20 });
  });

  it('gives two sizes over four times the BMR', () => {
    expect(chargeFor(actor(), [movement(85)], 1).speed).toBe('sprint');
  });

  it('only counts the resolved movements of the actor in the round', () => {
    const others = [
      movement(60, { id: 'declared', status: 'declared' }),
      movement(60, { id: 'other-actor', actorId: 'b' }),
      movement(60, { id: 'last-round', round: 0 }),
      movement(60, { id: 'attack', actionType: 'melee_attack' }),
    ];
    expect(chargeFor(actor(), others, 1)).toEqual({ speed: 'none', moved: 0, bmr: 20 });
  });

  it('gives no charge to an actor without BMR', () => {
    expect(chargeFor(actor(0), [movement(50)], 1).speed).toBe('none');
  });
});
