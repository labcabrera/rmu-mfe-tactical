import { describe, expect, it } from 'vitest';
import { Action, ActionMovement, MOVEMENT_TABLE } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import {
  backwardsChange,
  freePaceOption,
  initialMovementForm,
  movementPlan,
  MovementPlanInput,
  movementSetupReady,
  normalPaceCaption,
} from './movement-rules';

type Modifiers = ActionMovement['modifiers'];

const actor = (patch: object = {}): ActorRound =>
  ({
    actorId: 'a',
    movement: { bmr: 20, maxPace: 'sprint', baseDifficulty: 'm', penalty: 0 },
    effects: [],
    concentration: [],
    injuries: [],
    ...patch,
  }) as unknown as ActorRound;

const action = (patch: object = {}): Action =>
  ({
    id: 'x',
    gameId: 'g',
    actorId: 'a',
    round: 1,
    phaseStart: 1,
    actionPoints: 2,
    freeAction: false,
    actionType: 'movement',
    status: 'declared',
    ...patch,
  }) as unknown as Action;

const modifiers = (patch: Partial<Modifiers> = {}): Modifiers =>
  ({
    pace: '',
    requiredManeuver: false,
    skillId: 'running',
    difficulty: null,
    customBonus: null,
    light: null,
    ...patch,
  }) as Modifiers;

const plan = (patch: Partial<MovementPlanInput> = {}) =>
  movementPlan({
    action: action(),
    actorRound: actor(),
    actorRounds: [],
    roundActions: [],
    currentPhase: 1,
    modifiers: modifiers(),
    ...patch,
  });

const moved = (distance: number): Action =>
  action({ id: 'done', status: 'completed', movement: { calculated: { distance }, modifiers: { pace: 'walk' } } });

describe('movementPlan', () => {
  it('takes the pace of the AP spent by default, 1 BMR per AP', () => {
    const result = plan();
    expect(result.apPace).toBe('jog');
    expect(result.chosenPace).toBe('jog');
    expect(result.normalDistance).toBe(40);
    expect(result.pace).toBe('jog');
  });

  it('caps the distance by the slower pace chosen', () => {
    const result = plan({ action: action({ actionPoints: 4 }), modifiers: modifiers({ pace: 'walk' }) });
    expect(result.chosenPace).toBe('walk');
    expect(result.normalDistance).toBe(20);
  });

  it('counts a free movement by the phases it spans, not by AP', () => {
    const result = plan({
      action: action({ freeAction: true, phaseStart: 2, actionPoints: 4 }),
      currentPhase: 4,
      modifiers: modifiers({ pace: 'walk' }),
    });
    expect(result.actionPoints).toBe(3);
    expect(result.freeMovement).toBe(true);
    expect(result.distance(1)).toBe(60);
  });

  it('keeps one phase for a free movement on a board without a phase', () => {
    expect(plan({ action: action({ freeAction: true, phaseStart: 3 }), currentPhase: 0 }).actionPoints).toBe(1);
  });

  it('subtracts what the round already moved and blocks when nothing is left', () => {
    const partly = plan({ roundActions: [moved(60)] });
    expect(partly.left).toBe(20);
    expect(partly.nothingLeft).toBe(false);
    const spent = plan({ roundActions: [moved(80)] });
    expect(spent.left).toBe(0);
    expect(spent.nothingLeft).toBe(true);
    expect(spent.blocked).toBe(true);
  });

  it('does not count a resolved movement of the action itself', () => {
    expect(plan({ action: action(), roundActions: [action({ status: 'completed' })] }).left).toBe(80);
  });

  it('does not report nothing left for an actor that cannot move at all', () => {
    expect(plan({ actorRound: actor({ movement: { bmr: 0, maxPace: 'sprint' } }) }).nothingLeft).toBe(false);
  });

  it('halves the BMR going backwards and falls to the fastest pace still allowed', () => {
    const result = plan({ action: action({ actionPoints: 3 }), modifiers: modifiers({ backwards: true }) });
    expect(result.bmrReasons).toEqual(['backwards']);
    expect(result.apPace).toBe('run');
    expect(result.normalPaceDisabled('run')).toBe(true);
    expect(result.chosenPace).toBe('jog');
    expect(result.left).toBe(20);
  });

  it('makes a fleeing actor take the first pace from run on', () => {
    const result = plan({
      action: action({ actionPoints: 1 }),
      actorRound: actor({ effects: [{ status: 'fear-routed' }] }),
    });
    expect(result.fleeing).toBe(true);
    expect(result.normalPaceDisabled('walk')).toBe(true);
    expect(result.chosenPace).toBe('run');
  });

  it('caps the pace by the slowest injury', () => {
    const result = plan({
      actorRound: actor({ injuries: [{ status: 'open', limits: { pace: 'walk' } }] }),
    });
    expect(result.injuryLimit).toBe('walk');
    expect(result.maxPaceIndex).toBe(1);
    expect(result.normalPaceDisabled('jog')).toBe(true);
  });

  it('blocks a normal movement with two concentration foci, but not a free one', () => {
    const twoFoci = actor({ concentration: [{}, {}] });
    expect(plan({ actorRound: twoFoci }).blocked).toBe(true);
    expect(plan({ actorRound: twoFoci, action: action({ freeAction: true }) }).blocked).toBe(false);
  });

  it('gives a dash its distance and no tallied fatigue', () => {
    const result = plan({ modifiers: modifiers({ pace: 'dash' }) });
    expect(result.dashing).toBe(true);
    expect(result.chosenPace).toBe('dash');
    expect(result.normalDistance).toBe(50);
    expect(result.talliedFatigue).toBe(false);
  });

  it('never dashes in a free movement', () => {
    const result = plan({ action: action({ freeAction: true }), modifiers: modifiers({ pace: 'dash' }) });
    expect(result.dashing).toBe(false);
    expect(result.dashBlocked).toBeUndefined();
  });

  it('scales the added fatigue by the multiplier of the game and treats 0 as unset', () => {
    expect(plan({ fatigueMultiplier: 2 }).addedFatigue).toBeCloseTo(200 / 60);
    expect(plan({ fatigueMultiplier: 0 }).addedFatigue).toBeCloseTo(100 / 60);
  });

  it('does not tally the fatigue of climbing or swimming', () => {
    expect(plan({ modifiers: modifiers({ skillId: 'climbing' }) }).talliedFatigue).toBe(false);
    expect(plan({ modifiers: modifiers({ skillId: 'flying' }) }).talliedFatigue).toBe(true);
  });

  it('sends a free movement only with the pace chosen', () => {
    expect(plan({ action: action({ freeAction: true }) }).pace).toBeUndefined();
    expect(plan({ action: action({ freeAction: true }), modifiers: modifiers({ pace: 'run' }) }).pace).toBe('run');
  });
});

describe('movementSetupReady', () => {
  it('passes a plain normal movement', () => {
    expect(movementSetupReady(plan(), modifiers())).toBe(true);
  });

  it('needs the difficulty of a required maneuver', () => {
    const mods = modifiers({ requiredManeuver: true });
    expect(movementSetupReady(plan({ modifiers: mods }), mods)).toBe(false);
    const withDifficulty = modifiers({ requiredManeuver: true, difficulty: 'h' });
    expect(movementSetupReady(plan({ modifiers: withDifficulty }), withDifficulty)).toBe(true);
  });

  it('needs an explicit pace in a free movement', () => {
    const free = action({ freeAction: true });
    expect(movementSetupReady(plan({ action: free }), modifiers())).toBe(false);
    const chosen = modifiers({ pace: 'walk' });
    expect(movementSetupReady(plan({ action: free, modifiers: chosen }), chosen)).toBe(true);
  });

  it('refuses a pace the actor can no longer take', () => {
    const mods = modifiers({ pace: 'walk' });
    const result = plan({ modifiers: mods, roundActions: [moved(20)] });
    expect(result.blocked).toBe(false);
    expect(movementSetupReady(result, mods)).toBe(false);
  });

  it('refuses when nothing is left', () => {
    expect(movementSetupReady(plan({ roundActions: [moved(80)] }), modifiers())).toBe(false);
  });
});

describe('normalPaceCaption', () => {
  it('says the pace of the AP, the one over it, and nothing for a slower one', () => {
    const result = plan();
    expect(normalPaceCaption(result, 'jog')).toEqual({ key: 'movement-pace-of-ap' });
    expect(normalPaceCaption(result, 'run')).toEqual({ key: 'movement-pace-over-ap' });
    expect(normalPaceCaption(result, 'walk')).toBeNull();
  });

  it('prefers a pace reached over every other reason', () => {
    const result = plan({ roundActions: [moved(20)], actorRound: actor({ effects: [{ status: 'fear-broken' }] }) });
    expect(normalPaceCaption(result, 'walk')).toEqual({ key: 'movement-pace-reached' });
  });

  it('explains the slow limit, the injury and the load', () => {
    const backwards = plan({ modifiers: modifiers({ backwards: true }) });
    expect(normalPaceCaption(backwards, 'run')).toEqual({ key: 'movement-slow-max-jog' });
    const injured = plan({ actorRound: actor({ injuries: [{ status: 'open', limits: { pace: 'jog' } }] }) });
    expect(normalPaceCaption(injured, 'run')).toEqual({ key: 'injury-pace-limit', pace: 'jog' });
    const loaded = plan({ actorRound: actor({ movement: { bmr: 20, maxPace: 'jog' } }) });
    expect(normalPaceCaption(loaded, 'run')).toEqual({ key: 'over-max-pace' });
  });

  it('warns of a pace over what fear allows, and of the one a fleeing actor must exceed', () => {
    const retreating = plan({ actorRound: actor({ effects: [{ status: 'fear-retreat' }] }) });
    expect(normalPaceCaption(retreating, 'run')).toEqual({ key: 'fear-pace-warning-fear-retreat' });
    const routed = plan({ actorRound: actor({ effects: [{ status: 'fear-routed' }] }) });
    expect(normalPaceCaption(routed, 'jog')).toEqual({ key: 'fear-flees-at-run' });
  });
});

describe('freePaceOption', () => {
  const free = plan({ action: action({ freeAction: true }) });
  const row = (id: string) => MOVEMENT_TABLE.find((each) => each.id === id)!;
  const index = (id: string) => MOVEMENT_TABLE.findIndex((each) => each.id === id);

  it('shows the penalty of the pace, without its AP cost', () => {
    expect(freePaceOption(free, row('walk'), index('walk'))).toEqual({ disabled: false, caption: { text: '-25' } });
  });

  it('shows nothing for a pace without a penalty', () => {
    expect(freePaceOption(free, row('creep'), index('creep'))).toEqual({ disabled: false, caption: null });
  });

  it('stops at run', () => {
    expect(freePaceOption(free, row('sprint'), index('sprint'))).toEqual({
      disabled: true,
      caption: { key: 'free-movement-max-run' },
    });
  });

  it('gives the slow limit before the penalty', () => {
    const backwards = plan({ action: action({ freeAction: true }), modifiers: modifiers({ backwards: true }) });
    expect(freePaceOption(backwards, row('run'), index('run'))).toEqual({
      disabled: true,
      caption: { key: 'movement-slow-max-jog' },
    });
  });

  it('keeps a pace over the fear cap selectable, with a warning', () => {
    const balking = plan({
      action: action({ freeAction: true }),
      actorRound: actor({ effects: [{ status: 'fear-balk' }] }),
    });
    expect(freePaceOption(balking, row('jog'), index('jog'))).toEqual({
      disabled: false,
      caption: { key: 'fear-pace-warning-fear-balk' },
    });
  });

  it('disables a pace too slow for a fleeing actor', () => {
    const routed = plan({
      action: action({ freeAction: true }),
      actorRound: actor({ effects: [{ status: 'fear-routed' }] }),
    });
    expect(freePaceOption(routed, row('jog'), index('jog'))).toEqual({
      disabled: true,
      caption: { key: 'fear-flees-at-run' },
    });
  });
});

describe('backwardsChange', () => {
  it('forgets a pace over the slow limit when going backwards', () => {
    expect(backwardsChange('run', true)).toEqual({ backwards: true, pace: '' });
  });

  it('keeps a pace within it, and any pace going forwards again', () => {
    expect(backwardsChange('jog', true)).toEqual({ backwards: true, pace: 'jog' });
    expect(backwardsChange('run', false)).toEqual({ backwards: false, pace: 'run' });
  });
});

describe('initialMovementForm', () => {
  it('starts a new movement with the base difficulty of the actor and the light given', () => {
    const form = initialMovementForm(action(), actor(), 'dim');
    expect(form.modifiers).toMatchObject({ pace: '', skillId: 'running', difficulty: 'm', light: 'dim' });
    expect(form.roll).toEqual({ roll: null });
  });

  it('keeps the stored choices, filling a missing roll', () => {
    const stored = { modifiers: modifiers({ pace: 'run' }), roll: null };
    const form = initialMovementForm(action({ movement: stored }), actor(), null);
    expect(form.modifiers.pace).toBe('run');
    expect(form.roll).toEqual({ roll: null });
  });
});
