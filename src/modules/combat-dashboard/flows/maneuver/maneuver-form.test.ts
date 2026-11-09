import { describe, expect, it } from 'vitest';
import type { ManeuverModifiersListing } from '../../../api/action.dto';
import {
  activeSenseModifiers,
  combatTalentModifiers,
  combatTalentReady,
  effectiveDifficulty,
  featOfStrengthReady,
  initialForm,
  isConflicting,
  isFailureResult,
  isPercentResult,
  isSuccessResult,
  ManeuverForm,
  passiveSideReady,
  predictedModifiers,
  predictedTotal,
  selectionValue,
  toResolveRequest,
  usesLight,
} from './maneuver-form';

const listing = (patch: object = {}): ManeuverModifiersListing =>
  ({
    skill: { skillId: 'running', bonus: 20, ranks: 5, unskilled: false },
    maneuverType: 'absolute',
    conflicting: false,
    difficulty: {
      default: 'm',
      options: [
        { key: 'm', value: 0 },
        { key: 'h', value: -10 },
      ],
    },
    base: [],
    skillModifiers: [],
    ...patch,
  }) as unknown as ManeuverModifiersListing;

const form = (patch: Partial<ManeuverForm> = {}): ManeuverForm => ({
  ...initialForm(null, listing(), null),
  ...patch,
});

const flag = { key: 'flag', type: 'flag', value: 15 } as never;
const choice = { key: 'c', type: 'choice', options: [{ key: 'a', value: 5 }] } as never;
const count = { key: 'n', type: 'number', perUnit: 3 } as never;

describe('effectiveDifficulty', () => {
  it('fixes Battle Cry and Precision to Medium', () => {
    expect(effectiveDifficulty(form({ purpose: 'battle-cry', difficulty: 'h' }))).toBe('m');
    expect(effectiveDifficulty(form({ purpose: 'precision', difficulty: 'h' }))).toBe('m');
  });

  it('takes the difficulty of the load of a feat of strength, else the one chosen', () => {
    const feat = listing({ featOfStrength: { result: { difficulty: 'vh' } } });
    expect(effectiveDifficulty(form({ purpose: 'feat-of-strength', difficulty: 'h' }), feat)).toBe('vh');
    expect(effectiveDifficulty(form({ purpose: 'feat-of-strength', difficulty: 'h' }), listing())).toBe('h');
    expect(effectiveDifficulty(form({ difficulty: 'h' }), feat)).toBe('h');
  });
});

describe('selectionValue', () => {
  it('reads a flag only when ticked', () => {
    expect(selectionValue(flag, true)).toBe(15);
    expect(selectionValue(flag, false)).toBe(0);
  });

  it('reads the value of a choice, 0 for an unknown one', () => {
    expect(selectionValue(choice, 'a')).toBe(5);
    expect(selectionValue(choice, 'z')).toBe(0);
  });

  it('multiplies a number by its unit, ignoring other types of answer', () => {
    expect(selectionValue(count, 4)).toBe(12);
    expect(selectionValue(count, 'a')).toBe(0);
  });

  it('is 0 without a selection', () => {
    expect(selectionValue(flag, undefined)).toBe(0);
  });
});

describe('isConflicting', () => {
  it('uses the listing for its own type, else only absolute maneuvers conflict', () => {
    expect(isConflicting(listing({ conflicting: true }), 'absolute')).toBe(true);
    expect(isConflicting(listing({ maneuverType: 'percent' }), 'absolute')).toBe(true);
    expect(isConflicting(listing(), 'percent')).toBe(false);
  });
});

describe('combatTalentModifiers', () => {
  it('lowers Battle Cry by the level of the foe', () => {
    expect(combatTalentModifiers(form({ purpose: 'battle-cry', foeLevel: 3 }))[0]).toMatchObject({
      key: 'battle-cry-foe-level',
      value: -6,
    });
    expect(combatTalentModifiers(form({ purpose: 'battle-cry', foeLevel: 0 }))).toEqual([]);
  });

  it('gives Precision the value of its position, and the OB given up when there is any', () => {
    const modifiers = combatTalentModifiers(form({ purpose: 'precision', position: 'flank', obPenalty: 20 }));
    expect(modifiers.map((m) => m.value)).toEqual([-70, 20]);
    expect(combatTalentModifiers(form({ purpose: 'precision', position: 'rear' }))).toHaveLength(1);
    expect(combatTalentModifiers(form({ purpose: 'precision' }))).toEqual([]);
  });
});

describe('predictedModifiers', () => {
  it('starts with the skill and the difficulty, even at 0', () => {
    expect(
      predictedModifiers(listing({ skill: { skillId: 'x', bonus: 0, ranks: 0 } }), form()).map((m) => m.key)
    ).toEqual(['x', 'difficulty']);
  });

  it('marks an unskilled actor', () => {
    const unskilled = listing({ skill: { skillId: 'x', bonus: -25, ranks: 0, unskilled: true } });
    expect(predictedModifiers(unskilled, form())[0]).toMatchObject({ key: 'unskilled', value: -25 });
  });

  it('adds the selections, leaving out the ones worth nothing', () => {
    const catalog = listing({ skillModifiers: [flag, choice] });
    const keys = predictedModifiers(catalog, form({ selections: { flag: true } })).map((m) => m.key);
    expect(keys).toEqual(['running', 'difficulty', 'flag']);
  });

  it('adds the custom bonus', () => {
    expect(predictedModifiers(listing(), form({ customBonus: 7 })).at(-1)).toMatchObject({
      key: 'custom-bonus',
      value: 7,
    });
  });

  it('adds the conflict from the passive total, unless a target actor rolls', () => {
    const conflicting = listing({ conflicting: true });
    expect(predictedModifiers(conflicting, form({ passiveTotal: 130 })).at(-1)).toMatchObject({
      key: 'conflict',
      value: -30,
    });
    const withTarget = predictedModifiers(conflicting, form({ passiveTotal: 130, targetActorId: 't' }));
    expect(withTarget.map((m) => m.key)).not.toContain('conflict');
  });

  it('adds the light of the skill, or none with darkvision', () => {
    const lit = listing({
      light: { usage: 'helpful', options: [{ key: 'dim', value: -20, sensitivity: -5 }] },
    });
    expect(predictedModifiers(lit, form({ light: 'dim' })).map((m) => [m.key, m.value])).toEqual([
      ['running', 20],
      ['difficulty', 0],
      ['light', -20],
      ['light-sensitivity', -5],
    ]);
    const darkvision = predictedModifiers(lit, form({ light: 'dim', senseSelections: ['within-darkvision'] }));
    expect(darkvision.map((m) => m.key)).not.toContain('light');
  });

  it('falls back to the default light of the listing', () => {
    const lit = listing({ defaultLight: 'dim', light: { usage: 'helpful', options: [{ key: 'dim', value: -20 }] } });
    expect(predictedModifiers(lit, form()).map((m) => m.key)).toContain('light');
  });

  it('adds the talents ticked and the automatic ones only', () => {
    const talents = listing({
      situationalTraits: [
        { traitId: 'auto', mode: 'automatic', value: 5, condition: 'c', tier: 1 },
        { traitId: 'ticked', mode: 'ticked', value: 3, condition: 'c', tier: 1 },
        { traitId: 'other', mode: 'ticked', value: 9, condition: 'c', tier: 1 },
      ],
    });
    const keys = predictedModifiers(talents, form({ situationalTraits: ['ticked'] })).map((m) => m.key);
    expect(keys).toEqual(['running', 'difficulty', 'situational-auto', 'situational-ticked']);
  });

  it('totals the breakdown', () => {
    expect(
      predictedTotal(listing({ skillModifiers: [flag] }), form({ selections: { flag: true }, customBonus: 5 }))
    ).toBe(40);
  });
});

describe('light and senses', () => {
  it('uses light only when the listing asks for it and the sense is vision', () => {
    const lit = listing({ light: { usage: 'helpful', options: [] } });
    expect(usesLight(lit, form())).toBe(true);
    expect(usesLight(listing(), form())).toBe(false);
    expect(usesLight({ ...lit, senses: { modifiers: [] } } as never, form({ sense: 'smell' }))).toBe(false);
  });

  it('keeps the modifiers of the sense, usage and selection chosen', () => {
    const senses = listing({
      senses: {
        modifiers: [
          { key: 'a', value: 1 },
          { key: 'b', value: 2, sense: 'smell' },
          { key: 'c', value: 3, usage: 'hindered' },
          { key: 'd', value: 4, selection: 'within-darkvision' },
        ],
      },
    });
    expect(activeSenseModifiers(senses, form()).map((m) => m.key)).toEqual(['a']);
  });

  it('applies the values the game master typed', () => {
    const senses = listing({
      senses: {
        modifiers: [
          { key: 'heatsense', value: 5 },
          { key: 'missing-sense-x', value: -30, usage: 'helpful' },
        ],
      },
    });
    const applied = activeSenseModifiers(
      senses,
      form({ heatsenseModifier: 15, missingSenseModifier: -40, senseUsage: 'helpful' })
    );
    expect(applied.map((m) => m.value)).toEqual([15, -40]);
  });
});

describe('readiness', () => {
  it('needs a feat of strength load and a body weight', () => {
    const feat = form({ purpose: 'feat-of-strength' });
    expect(featOfStrengthReady(listing(), form())).toBe(true);
    expect(featOfStrengthReady(listing(), feat)).toBe(false);
    expect(featOfStrengthReady(listing(), { ...feat, featOfStrength: { loadWeight: 100 } })).toBe(false);
    expect(
      featOfStrengthReady(listing({ featOfStrength: { bodyWeight: 80 } }), {
        ...feat,
        featOfStrength: { loadWeight: 100 },
      })
    ).toBe(true);
  });

  it('needs the foe and position of a combat talent', () => {
    expect(combatTalentReady(form())).toBe(true);
    expect(combatTalentReady(form({ purpose: 'precision' }))).toBe(false);
    expect(combatTalentReady(form({ purpose: 'precision', foeActorId: 'f', position: 'rear' }))).toBe(true);
  });

  it('needs the roll of a passive target only in a conflicting maneuver', () => {
    const conflicting = listing({ conflicting: true });
    expect(passiveSideReady(conflicting, form({ targetActorId: 't' }))).toBe(false);
    expect(passiveSideReady(conflicting, form({ targetActorId: 't', passiveRoll: 40 }))).toBe(true);
    expect(passiveSideReady(conflicting, form())).toBe(true);
    expect(
      passiveSideReady(listing({ maneuverType: 'percent' }), form({ maneuverType: 'percent', targetActorId: 't' }))
    ).toBe(true);
  });
});

describe('initialForm', () => {
  it('takes the defaults of the listing', () => {
    expect(initialForm(null, listing({ difficulty: { default: 'h', options: [] } }), null).difficulty).toBe('h');
    expect(initialForm(null, null, null).difficulty).toBe('m');
  });

  it('keeps only a light the listing offers, preferring the ambient one', () => {
    const lit = listing({ light: { options: [{ key: 'dim' }] }, defaultLight: 'dim' });
    expect(initialForm(null, lit, 'bright').light).toBe('dim');
    expect(initialForm(null, listing({ light: { options: [{ key: 'dim' }] } }), 'bright').light).toBeNull();
    expect(initialForm(null, null, 'bright').light).toBe('bright');
  });

  it('forgets the passive total of a maneuver against an actor', () => {
    const stored = { modifiers: { targetActorId: 't', passiveTotal: 120 } } as never;
    expect(initialForm(stored, null, null)).toMatchObject({ targetActorId: 't', passiveTotal: null });
  });

  it('uses the purpose it was declared for when the action has none', () => {
    expect(initialForm(null, null, null, 'adrenal').purpose).toBe('adrenal');
  });
});

describe('toResolveRequest', () => {
  it('sends only what is set', () => {
    expect(toResolveRequest(listing(), form({ roll: 55 }))).toEqual({
      maneuverType: 'absolute',
      difficulty: 'm',
      roll: { roll: 55 },
    });
  });

  it('drops unknown and empty selections', () => {
    const catalog = listing({ skillModifiers: [flag, choice] });
    const request = toResolveRequest(catalog, form({ roll: 1, selections: { flag: true, c: false, zzz: 'a' } }));
    expect(request.selections).toEqual({ flag: true });
  });

  it('forces adrenal moves to absolute', () => {
    expect(
      toResolveRequest(listing(), form({ roll: 1, purpose: 'fortitude', maneuverType: 'percent' })).maneuverType
    ).toBe('absolute');
  });

  it('sends the passive side of a conflicting maneuver: the target actor, or the total', () => {
    const conflicting = listing({ conflicting: true });
    expect(
      toResolveRequest(conflicting, form({ roll: 1, targetActorId: 't', passiveRoll: 40, passiveBonus: 5 }))
    ).toMatchObject({
      targetActorId: 't',
      passiveRoll: 40,
      passiveBonus: 5,
    });
    expect(toResolveRequest(conflicting, form({ roll: 1, passiveTotal: 90 }))).toMatchObject({ passiveTotal: 90 });
    expect(toResolveRequest(listing(), form({ roll: 1, passiveTotal: 90 }))).not.toHaveProperty('passiveTotal');
  });

  it('sends the dice of the roll when known', () => {
    expect(toResolveRequest(listing(), form({ roll: 96, unmodified: 96, dice: [96, 40] })).roll).toEqual({
      roll: 96,
      unmodified: 96,
      dice: [96, 40],
    });
  });

  it('sends the talent fields of its purpose', () => {
    expect(
      toResolveRequest(listing(), form({ roll: 1, purpose: 'precision', position: 'rear', obPenalty: 10 }))
    ).toMatchObject({
      purpose: 'precision',
      position: 'rear',
      obPenalty: 10,
    });
  });
});

describe('result helpers', () => {
  it('classifies absolute results', () => {
    expect(isSuccessResult('partial-success')).toBe(true);
    expect(isSuccessResult('failure')).toBe(false);
    expect(isSuccessResult(undefined)).toBe(false);
    expect(isFailureResult('absolute-failure')).toBe(true);
    expect(isFailureResult('success')).toBe(false);
  });

  it('recognises a percent result', () => {
    expect(isPercentResult({ percent: 40 } as never)).toBe(true);
    expect(isPercentResult({ percent: 40, result: 'success' } as never)).toBe(false);
    expect(isPercentResult(undefined)).toBe(false);
  });
});
