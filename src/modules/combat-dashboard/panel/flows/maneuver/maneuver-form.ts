import type { ManeuverType } from '@labcabrera-rmu/rmu-react-shared-lib';
import type {
  ActionManeuver,
  ActionManeuverResult,
  ManeuverModifiersListing,
  ManeuverSelection,
  ManeuverSkillModifier,
  ResolveManeuverDto,
} from '../../../../api/action.dto';

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

/** The predicted breakdown, without the roll, in the order and with the keys of the API's breakdown. */
export const predictedModifiers = (
  listing: ManeuverModifiersListing,
  form: ManeuverForm
): { key: string; value: number }[] => {
  const modifiers: { key: string; value: number }[] = [
    { key: listing.skill.skillId, value: listing.skill.bonus },
    { key: 'difficulty', value: listing.difficulty.options.find((o) => o.key === form.difficulty)?.value ?? 0 },
    ...listing.base.map((modifier) => ({ key: modifier.key, value: modifier.value })),
  ];
  if (listing.light && form.light) {
    modifiers.push({ key: 'light', value: listing.light.options.find((o) => o.key === form.light)?.value ?? 0 });
  }
  listing.skillModifiers.forEach((modifier) =>
    modifiers.push({ key: modifier.key, value: selectionValue(modifier, form.selections[modifier.key]) })
  );
  if (form.customBonus) modifiers.push({ key: 'custom-bonus', value: form.customBonus });
  if (isConflicting(listing, form.maneuverType) && !form.targetActorId && form.passiveTotal !== null) {
    modifiers.push({ key: 'conflict', value: 100 - form.passiveTotal });
  }
  return modifiers.filter((modifier, index) => index < 2 || modifier.value !== 0);
};

export const predictedTotal = (listing: ManeuverModifiersListing, form: ManeuverForm): number =>
  predictedModifiers(listing, form).reduce((sum, modifier) => sum + modifier.value, 0);

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
    roll: { roll: form.roll as number, ...(form.unmodified !== null ? { unmodified: form.unmodified } : {}) },
  };
};

/** Results of an absolute maneuver shown as a success (green chip); anything else is a failure. */
const SUCCESS_RESULTS = ['success', 'absolute-success', 'partial-success'];

export const isSuccessResult = (result: string | undefined) => !!result && SUCCESS_RESULTS.includes(result);
export const isFailureResult = (result: string | undefined) =>
  result === 'failure' || result === 'absolute-failure';

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
