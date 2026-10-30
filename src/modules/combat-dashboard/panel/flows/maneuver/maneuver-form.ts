import type { ManeuverType, RollModifier, RuleParams, SkippedRule } from '@labcabrera-rmu/rmu-react-shared-lib';
import type {
  ActionManeuver,
  ActionManeuverResult,
  ManeuverModifiersListing,
  ManeuverSelection,
  ManeuverSkillModifier,
  ResolveManeuverDto,
} from '../../../../api/action.dto';
import type { ActorRound } from '../../../../api/actor-rounds.dto';
import { FrenzyPurpose, frenzyManeuverModifiers } from '../../../../services/frenzy-service';

// Client side of a maneuver roll (spec 010 §6): the choices of the modifiers step, the predicted total built from the
// listing values, and the request sent to resolve it. The API recalculates every value from its catalog.

export type ManeuverForm = {
  maneuverType: ManeuverType;
  difficulty: string;
  light: string | null;
  selections: Record<string, ManeuverSelection>;
  customBonus: number | null;
  passiveTotal: number | null;
  /** Actor of the game the maneuver is against (spec 022): its roll and bonus replace the passive total. */
  targetActorId: string | null;
  passiveRoll: number | null;
  /** Skill bonus of a target without a sheet (NPC). */
  passiveBonus: number | null;
  roll: number | null;
  /** First die of the open-ended roll (unusual event on 66). */
  unmodified: number | null;
  /** Adrenal Focus maneuver to enter or leave the frenzy (spec 040). */
  purpose: FrenzyPurpose | null;
};

/**
 * Translation key of a choice option of a catalog modifier: `<modifierKey>.<optionKey>` (as in
 * `data/core-law/maneuver-labels.json`). i18next resolves these flat dotted keys (`ignoreJSONStructure`, on by
 * default), since no locale key is nested.
 */
export const optionLabelKey = (modifierKey: string, optionKey: string) => `${modifierKey}.${optionKey}`;

/** Value of a catalog modifier for a choice: the flag's value, the option's value, or units × per unit. */
export const selectionValue = (modifier: ManeuverSkillModifier, selection: ManeuverSelection | undefined): number => {
  if (selection === undefined || selection === null) return 0;
  switch (modifier.type) {
    case 'flag':
      return selection === true ? (modifier.value ?? 0) : 0;
    case 'choice':
      return modifier.options?.find((option) => option.key === selection)?.value ?? 0;
    case 'number':
      return typeof selection === 'number' ? selection * (modifier.perUnit ?? 1) : 0;
    default:
      return 0;
  }
};

/** Whether the passive side's total may be given: absolute maneuvers only. */
export const isConflicting = (listing: ManeuverModifiersListing, maneuverType: ManeuverType): boolean =>
  listing.maneuverType === maneuverType ? listing.conflicting : maneuverType === 'absolute';

/**
 * The predicted breakdown, without the roll, in the order and with the keys of the API's breakdown. The actor gives the
 * modifiers of a frenzy maneuver (spec 040).
 */
export const predictedModifiers = (
  listing: ManeuverModifiersListing,
  form: ManeuverForm,
  actorRound?: ActorRound
): RollModifier[] => {
  // Same groups, rules and inputs as the API's breakdown (spec 052), so the prediction explains itself too
  const { skill } = listing;
  const specialization: RuleParams = skill.specialization ? { specialization: skill.specialization } : {};
  const modifiers: RollModifier[] = [
    skill.unskilled
      ? {
          key: 'unskilled',
          value: skill.bonus,
          group: 'skill',
          source: 'skill',
          rule: MANEUVER_RULES.unskilled,
          params: { skill: skill.skillId, ...specialization },
        }
      : {
          key: skill.skillId,
          value: skill.bonus,
          group: 'skill',
          source: 'skill',
          rule: MANEUVER_RULES.skill,
          params: { ranks: skill.ranks, ...specialization },
        },
    {
      key: 'difficulty',
      value: listing.difficulty.options.find((o) => o.key === form.difficulty)?.value ?? 0,
      group: 'situation',
      source: 'difficulty',
      rule: MANEUVER_RULES.difficulty,
      params: { difficulty: form.difficulty },
    },
    ...listing.base.map(({ key, value, group, source, rule, params }) => ({ key, value, group, source, rule, params })),
  ];
  if (listing.light && form.light) {
    modifiers.push({
      key: 'light',
      value: listing.light.options.find((o) => o.key === form.light)?.value ?? 0,
      group: 'situation',
      source: 'light',
      rule: MANEUVER_RULES.light,
      params: { light: form.light, usage: listing.light.usage },
    });
  }
  listing.skillModifiers.forEach((modifier) =>
    modifiers.push({
      key: modifier.key,
      value: selectionValue(modifier, form.selections[modifier.key]),
      group: 'situation',
      source: 'catalog',
    })
  );
  if (actorRound) {
    frenzyManeuverModifiers(actorRound, form.purpose).forEach((modifier) =>
      modifiers.push({ ...modifier, group: 'situation', source: 'frenzy' })
    );
  }
  if (form.customBonus)
    modifiers.push({ key: 'custom-bonus', value: form.customBonus, group: 'situation', source: 'custom' });
  if (isConflicting(listing, form.maneuverType) && !form.targetActorId && form.passiveTotal !== null) {
    modifiers.push({
      key: 'conflict',
      value: 100 - form.passiveTotal,
      group: 'situation',
      source: 'conflict',
      rule: MANEUVER_RULES.conflict,
      params: { passive: form.passiveTotal },
    });
  }
  return modifiers.filter((modifier, index) => index < 2 || modifier.value !== 0);
};

/** Rule references of the maneuver modifiers, as the API gives them (spec 052). */
export const MANEUVER_RULES = {
  skill: 'Table 3-0b',
  unskilled: 'Ch. 3, Skill Bonus',
  difficulty: '§5.1',
  light: 'Table 15-7',
  conflict: '§8.2',
} as const;

/** The rules the prediction does not apply: the listing's, and a light the skill does not use (spec 052). */
export const predictedSkipped = (listing: ManeuverModifiersListing, form: ManeuverForm): SkippedRule[] => [
  ...(listing.skipped ?? []),
  ...(!listing.light && form.light
    ? [
        {
          source: 'light',
          group: 'situation' as const,
          reason: 'light-not-needed',
          rule: MANEUVER_RULES.light,
          params: { light: form.light },
        },
      ]
    : []),
];

export const predictedTotal = (
  listing: ManeuverModifiersListing,
  form: ManeuverForm,
  actorRound?: ActorRound
): number => predictedModifiers(listing, form, actorRound).reduce((sum, modifier) => sum + modifier.value, 0);

/** Choices of a maneuver: the stored ones of the action, or the listing's defaults and the remembered light. */
export const initialForm = (
  maneuver: ActionManeuver | null,
  listing: ManeuverModifiersListing | null,
  rememberedLight: string | null
): ManeuverForm => {
  const modifiers = maneuver?.modifiers;
  const lightKeys = listing?.light?.options.map((o) => o.key) ?? [];
  const light = modifiers?.light ?? rememberedLight;
  return {
    maneuverType: (modifiers?.maneuverType as ManeuverType) || listing?.maneuverType || 'absolute',
    difficulty: modifiers?.difficulty || listing?.difficulty.default || 'm',
    light: light && (!listing || lightKeys.includes(light)) ? light : null,
    selections: modifiers?.selections ?? {},
    customBonus: modifiers?.customBonus ?? null,
    passiveTotal: modifiers?.targetActorId ? null : (modifiers?.passiveTotal ?? null),
    targetActorId: modifiers?.targetActorId ?? null,
    passiveRoll: null,
    passiveBonus: null,
    roll: maneuver?.roll?.roll ?? null,
    unmodified: null,
    purpose: modifiers?.purpose ?? null,
  };
};

/** The passive side of a conflicting maneuver: a target actor with its roll, or the total typed by hand. */
const passiveSide = (form: ManeuverForm): Partial<ResolveManeuverDto> => {
  if (form.targetActorId) {
    return {
      targetActorId: form.targetActorId,
      ...(form.passiveRoll !== null ? { passiveRoll: form.passiveRoll } : {}),
      ...(form.passiveBonus !== null ? { passiveBonus: form.passiveBonus } : {}),
    };
  }
  return form.passiveTotal !== null ? { passiveTotal: form.passiveTotal } : {};
};

/** A target actor needs its roll before the maneuver is resolved. */
export const passiveSideReady = (listing: ManeuverModifiersListing, form: ManeuverForm): boolean =>
  !isConflicting(listing, form.maneuverType) || !form.targetActorId || form.passiveRoll !== null;

/** Body of `PATCH /actions/{id}/maneuver/resolve`; unset choices are left out. */
export const toResolveRequest = (listing: ManeuverModifiersListing, form: ManeuverForm): ResolveManeuverDto => {
  const known = new Set(listing.skillModifiers.map((modifier) => modifier.key));
  const selections = Object.fromEntries(
    Object.entries(form.selections).filter(([key, value]) => known.has(key) && value !== false && value !== null)
  );
  return {
    maneuverType: form.maneuverType,
    difficulty: form.difficulty,
    ...(listing.light && form.light ? { light: form.light } : {}),
    ...(Object.keys(selections).length > 0 ? { selections } : {}),
    ...(form.customBonus ? { customBonus: form.customBonus } : {}),
    ...(isConflicting(listing, form.maneuverType) ? passiveSide(form) : {}),
    ...(form.purpose ? { purpose: form.purpose } : {}),
    roll: { roll: form.roll as number, ...(form.unmodified !== null ? { unmodified: form.unmodified } : {}) },
  };
};

/** Results of an absolute maneuver shown as a success (green chip); anything else is a failure. */
const SUCCESS_RESULTS = ['success', 'absolute-success', 'partial-success'];

export const isSuccessResult = (result: string | undefined) => !!result && SUCCESS_RESULTS.includes(result);
export const isFailureResult = (result: string | undefined) => result === 'failure' || result === 'absolute-failure';

/** Percent maneuver result, as opposed to an absolute one. */
export const isPercentResult = (result: ActionManeuverResult | undefined) =>
  !!result && result.percent !== undefined && result.percent !== null && !result.result;

const LIGHT_STORAGE_KEY = 'rmu-tactical-maneuver-light';

/**
 * Last light chosen in a maneuver of a game (spec 010, decision 8): light is not stored in the game, so the board
 * remembers it for the session. Storage may be unavailable (private mode), hence the try/catch.
 */
export const rememberedLight = (gameId: string | null | undefined): string | null => {
  try {
    return sessionStorage.getItem(`${LIGHT_STORAGE_KEY}:${gameId ?? ''}`);
  } catch {
    return null;
  }
};

export const rememberLight = (gameId: string | null | undefined, light: string | null) => {
  try {
    const key = `${LIGHT_STORAGE_KEY}:${gameId ?? ''}`;
    if (light) sessionStorage.setItem(key, light);
    else sessionStorage.removeItem(key);
  } catch {
    // The light is only a convenience: without storage it is chosen again.
  }
};
