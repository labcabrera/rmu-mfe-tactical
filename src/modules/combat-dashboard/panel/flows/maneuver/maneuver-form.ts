import {
  COMBAT_TALENT_PURPOSES,
  DEFAULT_SENSE,
  DEFAULT_SENSE_USAGE,
  type CombatTalentPurpose,
  type ManeuverSenseModifier,
  type ManeuverType,
  type PrecisionPosition,
  type RollModifier,
  type RuleParams,
  type Sense,
  type SenseSelection,
  type SenseUsage,
  type SkippedRule,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import type {
  ActionManeuver,
  ActionManeuverResult,
  ManeuverModifiersListing,
  ManeuverPurpose,
  ManeuverSelection,
  ManeuverSkillModifier,
  ResolveManeuverDto,
} from '../../../../api/action.dto';
import type { ActorRound } from '../../../../api/actor-rounds.dto';
import { FOE_PURPOSES } from '../../../../services/combat-talents-service';
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
  /** Every die of the roll: the API checks them with the actor's roll profile (workspace spec 076). */
  dice: number[] | null;
  /** Adrenal Focus maneuver to enter or leave the frenzy (spec 040), or a combat talent (workspace spec 076). */
  purpose: ManeuverPurpose | null;
  /** Sense Weakness, Study Offense and Precision: the foe (workspace spec 076). */
  foeActorId: string | null;
  /** Battle Cry: level of the highest level foe, -2 per level. */
  foeLevel: number | null;
  /** Precision: where the attacker stands, and the OB it gives up to make the maneuver easier. */
  position: PrecisionPosition | null;
  obPenalty: number | null;
  /** Perception and Tracking (workspace spec 076): the sense used, its usage and the situations of the talents. */
  sense: Sense;
  senseUsage: SenseUsage;
  senseSelections: SenseSelection[];
  /** Missing Sense where the sense only helps (-50 to -20) and Heatsense (0 to 20); the listing's value when null. */
  missingSenseModifier: number | null;
  heatsenseModifier: number | null;
};

/** Combat talent maneuvers whose difficulty is fixed by the API: Medium (Battle Cry; Precision has its position). */
const FIXED_DIFFICULTY_PURPOSES: string[] = ['battle-cry', 'precision'];
const MEDIUM = 'm';

export const isCombatTalentPurpose = (purpose: ManeuverPurpose | null | undefined): purpose is CombatTalentPurpose =>
  !!purpose && (COMBAT_TALENT_PURPOSES as readonly string[]).includes(purpose);

/** The difficulty the maneuver is resolved with: Medium for Battle Cry and Precision, else the one chosen. */
export const effectiveDifficulty = (form: ManeuverForm): string =>
  form.purpose && FIXED_DIFFICULTY_PURPOSES.includes(form.purpose) ? MEDIUM : form.difficulty;

/** Precision (workspace spec 076, §2.6): the difficulty of each position of the attacker. */
export const PRECISION_POSITION_VALUES: Record<PrecisionPosition, number> = { rear: -50, flank: -70, front: -100 };
const BATTLE_CRY_PER_FOE_LEVEL = -2;
const TALENT_RULE = 'Character Companion';

/** Modifiers the API adds to the maneuver of a combat talent, with its keys (workspace spec 076, §2.6). */
export const combatTalentModifiers = (form: ManeuverForm): RollModifier[] => {
  const modifiers: RollModifier[] = [];
  const source = form.purpose ?? undefined;
  if (form.purpose === 'battle-cry' && (form.foeLevel ?? 0) > 0) {
    modifiers.push({
      key: 'battle-cry-foe-level',
      value: BATTLE_CRY_PER_FOE_LEVEL * form.foeLevel!,
      group: 'situation',
      source,
      rule: TALENT_RULE,
      params: { foeLevel: form.foeLevel! },
    });
  }
  if (form.purpose === 'precision' && form.position) {
    modifiers.push({
      key: 'precision-position',
      value: PRECISION_POSITION_VALUES[form.position],
      group: 'situation',
      source,
      rule: TALENT_RULE,
      params: { position: form.position },
    });
    if ((form.obPenalty ?? 0) > 0)
      modifiers.push({
        key: 'precision-ob-penalty',
        value: form.obPenalty!,
        group: 'situation',
        source,
        rule: TALENT_RULE,
      });
  }
  return modifiers;
};

/** The listing's senses apply to this maneuver and the sense chosen is vision (light only counts then). */
export const usesLight = (listing: ManeuverModifiersListing, form: ManeuverForm): boolean =>
  !!listing.light && (!listing.senses || form.sense === 'vision');

/** The sense talent modifiers of the listing that apply to the choices, with the values chosen by the game master. */
export const activeSenseModifiers = (listing: ManeuverModifiersListing, form: ManeuverForm): ManeuverSenseModifier[] =>
  (listing.senses?.modifiers ?? [])
    .filter(
      (modifier) =>
        (!modifier.sense || modifier.sense === form.sense) &&
        (!modifier.usage || modifier.usage === form.senseUsage) &&
        (!modifier.selection || form.senseSelections.includes(modifier.selection))
    )
    .map((modifier) => {
      if (modifier.key === 'heatsense' && form.heatsenseModifier !== null)
        return { ...modifier, value: form.heatsenseModifier };
      if (
        modifier.usage === 'helpful' &&
        modifier.key.startsWith('missing-sense-') &&
        form.missingSenseModifier !== null
      )
        return { ...modifier, value: form.missingSenseModifier };
      return modifier;
    });

/** The light the maneuver is resolved with: the one chosen, or the ambient light of the game (workspace spec 076). */
export const effectiveLight = (listing: ManeuverModifiersListing, form: ManeuverForm): string | null =>
  form.light ?? listing.defaultLight ?? null;

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
      value: listing.difficulty.options.find((o) => o.key === effectiveDifficulty(form))?.value ?? 0,
      group: 'situation',
      source: 'difficulty',
      rule: MANEUVER_RULES.difficulty,
      params: { difficulty: effectiveDifficulty(form) },
    },
    ...listing.base.map(({ key, value, group, source, rule, params }) => ({ key, value, group, source, rule, params })),
  ];
  const light = effectiveLight(listing, form);
  if (listing.light && usesLight(listing, form) && light) {
    const option = listing.light.options.find((o) => o.key === light);
    // Darkvision within its range sees as in daylight (workspace spec 076); hiding reads the darkness only
    const darkvision = listing.light.usage !== 'hiding' && form.senseSelections.includes('within-darkvision');
    modifiers.push({
      key: 'light',
      value: darkvision ? 0 : (option?.value ?? 0),
      group: 'situation',
      source: 'light',
      rule: MANEUVER_RULES.light,
      params: { light, usage: listing.light.usage },
    });
    if (option?.sensitivity)
      modifiers.push({
        key: 'light-sensitivity',
        value: option.sensitivity,
        // The shared breakdown has no senses group: they show with the situation
        group: 'situation',
        source: 'senses',
        rule: MANEUVER_RULES.lightSensitivity,
        params: { light },
      });
  }
  activeSenseModifiers(listing, form).forEach((modifier) =>
    modifiers.push({
      key: modifier.key,
      value: modifier.value,
      group: 'situation',
      source: 'senses',
      rule: modifier.rule,
      params: { ...modifier.params, sense: form.sense },
    })
  );
  listing.skillModifiers.forEach((modifier) =>
    modifiers.push({
      key: modifier.key,
      value: selectionValue(modifier, form.selections[modifier.key]),
      group: 'situation',
      source: 'catalog',
    })
  );
  if (actorRound && form.purpose && !isCombatTalentPurpose(form.purpose)) {
    frenzyManeuverModifiers(actorRound, form.purpose as FrenzyPurpose).forEach((modifier) =>
      modifiers.push({ ...modifier, group: 'situation', source: 'frenzy' })
    );
  }
  modifiers.push(...combatTalentModifiers(form));
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
  lightSensitivity: '§4.5',
  conflict: '§8.2',
} as const;

/** The rules the prediction does not apply: the listing's, and a light the skill does not use (spec 052). */
export const predictedSkipped = (listing: ManeuverModifiersListing, form: ManeuverForm): SkippedRule[] => [
  ...(listing.skipped ?? []),
  ...((!listing.light || !usesLight(listing, form)) && form.light
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

/**
 * Choices of a maneuver: the stored ones of the action, or the listing's defaults: the ambient light of the game
 * (workspace spec 076), else the remembered light, and the purpose it was declared for.
 */
export const initialForm = (
  maneuver: ActionManeuver | null,
  listing: ManeuverModifiersListing | null,
  rememberedLight: string | null,
  declaredPurpose: ManeuverPurpose | null = null
): ManeuverForm => {
  const modifiers = maneuver?.modifiers;
  const lightKeys = listing?.light?.options.map((o) => o.key) ?? [];
  const light = modifiers?.light ?? listing?.defaultLight ?? rememberedLight;
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
    dice: null,
    purpose: modifiers?.purpose ?? declaredPurpose,
    foeActorId: modifiers?.foeActorId ?? null,
    foeLevel: modifiers?.foeLevel ?? null,
    position: modifiers?.position ?? null,
    obPenalty: modifiers?.obPenalty ?? null,
    sense: listing?.senses?.default ?? DEFAULT_SENSE,
    senseUsage: listing?.senses?.defaultUsage ?? DEFAULT_SENSE_USAGE,
    senseSelections: [],
    missingSenseModifier: null,
    heatsenseModifier: null,
  };
};

/** The choices a combat talent maneuver needs are there: its foe, and the position of Precision. */
export const combatTalentReady = (form: ManeuverForm): boolean =>
  !isCombatTalentPurpose(form.purpose) ||
  ((!FOE_PURPOSES.includes(form.purpose) || !!form.foeActorId) && (form.purpose !== 'precision' || !!form.position));

/** Fields of the request for a combat talent maneuver (workspace spec 076). */
const combatTalentRequest = (form: ManeuverForm): Partial<ResolveManeuverDto> => {
  if (!isCombatTalentPurpose(form.purpose)) return {};
  return {
    ...(FOE_PURPOSES.includes(form.purpose) && form.foeActorId ? { foeActorId: form.foeActorId } : {}),
    ...(form.purpose === 'battle-cry' && form.foeLevel !== null ? { foeLevel: form.foeLevel } : {}),
    ...(form.purpose === 'precision' && form.position ? { position: form.position } : {}),
    ...(form.purpose === 'precision' && (form.obPenalty ?? 0) > 0 ? { obPenalty: form.obPenalty! } : {}),
  };
};

/** Fields of the request for the senses of Perception and Tracking (workspace spec 076). */
const sensesRequest = (listing: ManeuverModifiersListing, form: ManeuverForm): Partial<ResolveManeuverDto> => {
  if (!listing.senses) return {};
  const active = activeSenseModifiers(listing, form);
  const missingHelpful = active.some(
    (modifier) => modifier.key.startsWith('missing-sense-') && modifier.usage === 'helpful'
  );
  const heatsense = active.some((modifier) => modifier.key === 'heatsense');
  return {
    sense: form.sense,
    senseUsage: form.senseUsage,
    ...(form.senseSelections.length > 0 ? { senseSelections: form.senseSelections } : {}),
    ...(missingHelpful && form.missingSenseModifier !== null
      ? { missingSenseModifier: form.missingSenseModifier }
      : {}),
    ...(heatsense && form.heatsenseModifier !== null ? { heatsenseModifier: form.heatsenseModifier } : {}),
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
    difficulty: effectiveDifficulty(form),
    ...(usesLight(listing, form) && form.light ? { light: form.light } : {}),
    ...(Object.keys(selections).length > 0 ? { selections } : {}),
    ...(form.customBonus ? { customBonus: form.customBonus } : {}),
    ...(isConflicting(listing, form.maneuverType) ? passiveSide(form) : {}),
    ...(form.purpose ? { purpose: form.purpose } : {}),
    ...combatTalentRequest(form),
    ...sensesRequest(listing, form),
    roll: {
      roll: form.roll as number,
      ...(form.unmodified !== null ? { unmodified: form.unmodified } : {}),
      ...(form.dice && form.dice.length > 0 ? { dice: form.dice } : {}),
    },
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
