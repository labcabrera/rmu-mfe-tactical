import type { FrenzyPurpose } from '../services/frenzy-service';
import { KeyValue, ManeuverModifier, ManeuverModifierOption, ManeuverType } from '@labcabrera-rmu/rmu-react-shared-lib';

// Same values as rmu-api-tactical (action-status.vo.ts). `pending_roll` is the current status while the attack,
// critical or fumble rolls are pending: each attack's `status` says which roll it waits for.
// `pending_attack_roll` and `critical_or_fumble_roll` are the older statuses, still present in stored actions.
// Spec 011: `interrupted` (another action replaced it or the actor could not act), `expired` (the round ended),
// `carried` (it goes on in a continuation action of the next round) and `held` (held by the game master).
export type ActionStatus =
  | 'declared'
  | 'prepared'
  | 'parry'
  | 'pending_roll'
  | 'pending_attack_roll'
  | 'critical_or_fumble_roll'
  | 'pending_apply'
  | 'completed'
  | 'interrupted'
  | 'expired'
  | 'carried'
  | 'held';

/** Statuses of an action that is over: it takes no more action points nor resolution steps. */
export const CLOSED_ACTION_STATUSES: ActionStatus[] = ['completed', 'interrupted', 'expired', 'carried'];

/**
 * How close an action is to being resolved (spec 011, §4), computed by the API: below its minimum AP and able to
 * reach it this round (`blocked`) or not (`unreachable`), resolvable with a penalty (`ready`) or without one
 * (`optimal`), held, with resolution steps under way, or over.
 */
export type ActionReadiness = 'blocked' | 'unreachable' | 'ready' | 'optimal' | 'held' | 'in-resolution' | 'done';

/** AP range of an action type (spec 011, §3). */
export type ActionApProfile = { min: number; max: number };

/** Why an action is resolved out of turn (spec 011, §6). */
export type ForceReason = 'withdrawal' | 'pass-through' | 'effect' | 'gm';
export const FORCE_REASONS: ForceReason[] = ['withdrawal', 'pass-through', 'effect', 'gm'];
/** Reasons that can declare a new action already forced (`POST /actions` with `forced`). */
export const NEW_ACTION_FORCE_REASONS: ForceReason[] = ['effect', 'gm'];

/** Where the AP of a forced action come from: the actor's next free AP, none, or the ones already spent. */
export type ForcedApSource = 'next-phase' | 'none' | 'as-spent';

export type ActionResolution = {
  mode: 'normal' | 'forced';
  reason?: ForceReason;
  apSource?: ForcedApSource;
  note?: string;
};

/** Per-attack status (rmu-api-tactical attack-status.vo.ts): the roll the attack is waiting for. */
export type AttackStatus =
  | 'pending_attack_roll'
  | 'pending_critical_roll'
  | 'pending_fumble_roll'
  | 'pending_apply'
  | 'completed';

export type AttackType = 'melee' | 'ranged' | 'thrown';
export type ChargeSpeed = 'none' | 'jog' | 'sprint';

export type ActionType =
  | 'movement'
  | 'melee_attack'
  | 'ranged_attack'
  | 'maneuver'
  | 'stand_up'
  | 'dodge'
  | 'draw_and_load'
  | 'cast_spell'
  | 'other'
  | 'skill'
  | 'free';

/** Action types completed without rolls (`PATCH /actions/{id}/complete`). */
export const SIMPLE_ACTION_TYPES: ActionType[] = ['stand_up', 'dodge', 'draw_and_load', 'other'];
export type CalledShot = 'none' | 'head' | 'chest' | 'abdomen' | 'arms' | 'legs';

export const MOVEMENT_TABLE = [
  { id: 'creep', multiplier: 1 / 8, penalty: '-', label: 'x1/2' },
  { id: 'walk', multiplier: 1 / 4, penalty: '-25 | 1AP', label: 'x1' },
  { id: 'jog', multiplier: 1 / 2, penalty: '-50 | 2AP', label: 'x2' },
  { id: 'run', multiplier: 3 / 4, penalty: '-75 | 3AP', label: 'x3' },
  { id: 'sprint', multiplier: 1, penalty: '4AP', label: 'x4' },
  { id: 'dash', multiplier: 1.25, penalty: '4AP+', label: 'x5' },
];

export const DIFFICULTY_TABLE: KeyValue[] = [
  { key: 'c', value: 70 },
  { key: 's', value: 50 },
  { key: 'r', value: 30 },
  { key: 'e', value: 20 },
  { key: 'l', value: 10 },
  { key: 'm', value: 0 },
  { key: 'h', value: -10 },
  { key: 'vh', value: -20 },
  { key: 'xh', value: -30 },
  { key: 'sf', value: -50 },
  { key: 'a', value: -70 },
  { key: 'ni', value: -100 },
];

export type AttackDeclaration = {
  attacks: ActionAttack[];
  parries: ActionParry[] | undefined;
};

export type ParryDeclarationItem = {
  parryId: string;
  parry: number;
};

export type ParryDeclaration = {
  parries: ParryDeclarationItem[];
};

export type ActionMovementModifiers = {
  pace: string;
  requiredManeuver: boolean;
  skillId: string;
  difficulty: string | null;
  customBonus: number | null;
  light?: string | null;
};

/** Table 5-1: light helps movement maneuvers (the helpful column); the API applies the same values. */
export const MOVEMENT_LIGHT_OPTIONS: { key: string; value: number }[] = [
  { key: 'no_shadows', value: 0 },
  { key: 'light_shadows', value: -5 },
  { key: 'medium_shadows', value: -10 },
  { key: 'heavy_shadows', value: -15 },
  { key: 'dark', value: -25 },
  { key: 'extremely_dark', value: -35 },
  { key: 'pitch_black', value: -50 },
];

export type ActionMovementCalculated = {
  bmr: number;
  paceMultiplier: number;
  percent: number;
  distance: number;
  distanceAdjusted: number;
  description: string;
  critical: string | null;
};

/** Who a modifier favours, or which stage of the resolution adds it. */
export type ModifierGroup = 'offense' | 'defense' | 'situation' | 'critical' | 'resolution';

export type KeyValueModifier = {
  key: string;
  value: number;
  /** Breakdown group of the combat plugin that added it. */
  group?: ModifierGroup;
  /** Id of the combat plugin that added it. */
  source?: string;
};

export type ActionRoll = {
  modifiers?: KeyValue[];
  roll: number | null;
  totalRoll?: number;
};

export type ActionMovement = {
  modifiers: ActionMovementModifiers;
  roll: ActionRoll;
  calculated?: ActionMovementCalculated;
};

/** Choice for a catalog modifier of the skill: the option key, the flag, or the number of units. */
export type ManeuverSelection = string | boolean | number;

export type ActionManeuverModifiers = {
  skillId: string | null;
  specialization?: string | null;
  maneuverType: ManeuverType | string | null;
  difficulty: string | null;
  /** @deprecated Light usage sent before spec 010; the skill's maneuver profile says it now. */
  lightModifier?: string | null;
  light: string | null;
  customBonus: number | null;
  selections?: Record<string, ManeuverSelection>;
  /** Conflicting maneuver: total of the passive side. */
  passiveTotal?: number | null;
  /** Actor the maneuver is against, and the skill its sheet gave the passive total with (spec 022). */
  targetActorId?: string | null;
  passiveSkillId?: string | null;
  /** Adrenal Focus maneuver to enter or leave the frenzy (spec 040). */
  purpose?: FrenzyPurpose | null;
};

/** Effect of an absolute maneuver result (core's table). */
export type ActionManeuverEffect = {
  status: string;
  value?: number;
  modifier?: string;
  rounds?: number;
  roundDelay?: number;
};

/** Absolute results carry `result`; percent ones `percent` (and `completed` when the task reaches 100). */
export type ActionManeuverResult = {
  result?: string;
  message?: string;
  effects?: ActionManeuverEffect[];
  /** The unmodified roll was a 66: the message ends with the table's unusual event. */
  unusualEvent?: boolean;
  percent?: number;
  critical?: string | null;
  completed?: boolean;
  /** Trading: price as a percent of the asked one, 50 to 200 (spec 022). */
  price?: number;
  /** Leadership: outcome of the morale table (refuses, obeys...), and the modifier to later morale rolls. */
  outcome?: string;
  moraleModifier?: number;
  moraleModifierDays?: number;
};

export type ActionManeuver = {
  modifiers: ActionManeuverModifiers;
  roll: ActionRoll | undefined;
  result: ActionManeuverResult | undefined;
  /** Percent maneuvers: percent accumulated, including the earlier rounds of the task. */
  progress?: number;
  /** Percent maneuver this one continues (spec 010 §4.4). */
  continuesActionId?: string;
};

/** Where a base modifier of a maneuver comes from. */
export type ManeuverBaseSource = 'actor-round' | 'equipment' | 'movement' | 'action';

/** Modifier the API applies by itself (penalties, armor, encumbrance, pace, AP). Read-only in the UI. */
export type ManeuverBaseModifier = { key: string; value: number; source: ManeuverBaseSource | string };

/** Skill modifier of core's catalog, as the listing returns it. */
export type ManeuverSkillModifier = Omit<ManeuverModifier, 'accessType' | 'owner'>;

/** `GET /actions/{id}/maneuver/modifiers`: what a maneuver roll can take (spec 010 §3). */
export type ManeuverModifiersListing = {
  skill: { skillId: string; specialization: string | null; bonus: number; ranks: number; unskilled: boolean };
  maneuverType: ManeuverType;
  resultTable: string;
  base: ManeuverBaseModifier[];
  difficulty: { default: string; options: ManeuverModifierOption[] };
  /** Only for skills that use light; the values already take the usage into account. */
  light?: { usage: 'helpful' | 'required' | 'hiding'; options: ManeuverModifierOption[] };
  skillModifiers: ManeuverSkillModifier[];
  /** An absolute maneuver may take the passive side's total. */
  conflicting: boolean;
  /** Percent maneuvers: progress accumulated before this roll. */
  progress?: number;
};

/** `PATCH /actions/{id}/maneuver/resolve` (spec 010 §4.1). */
export type ResolveManeuverDto = {
  skillId?: string;
  specialization?: string;
  maneuverType?: ManeuverType;
  difficulty?: string;
  light?: string;
  selections?: Record<string, ManeuverSelection>;
  customBonus?: number;
  passiveTotal?: number;
  /** Actor the maneuver is against: its roll and skill bonus (from its sheet, typed for an NPC) give the passive total. */
  targetActorId?: string;
  passiveRoll?: number;
  passiveBonus?: number;
  /** Spec 040: enter or leave the frenzy on a success. */
  purpose?: FrenzyPurpose;
  roll: { roll: number; unmodified?: number };
};

/** Maneuver part of `POST /actions`. */
export type ManeuverDeclarationDto = {
  skillId: string;
  maneuverType?: ManeuverType;
  specialization?: string;
  continuesActionId?: string;
};

export type Action = {
  id: string;
  gameId: string;
  actorId: string;
  round: number;
  actionType: ActionType;
  freeAction: boolean;
  phaseStart: number;
  phaseEnd: number | null;
  status: ActionStatus;
  /** AP spent on the action, from the AP ledger of its actor round. */
  actionPoints: number | null;
  /** AP range of the action (absent in responses of older APIs). */
  apProfile?: ActionApProfile;
  readiness?: ActionReadiness | null;
  /** Penalty of resolving the action with its AP now (0 or negative). */
  readinessPenalty?: number | null;
  resolution?: ActionResolution;
  /** Action of the previous round this one continues (open rounds). */
  continuesActionId?: string;
  /** AP the continued action had spent, counted in this one. */
  carriedAp?: number;
  movement: ActionMovement | null;
  maneuver: ActionManeuver | null;
  attacks: ActionAttack[] | null;
  parries: ActionParry[] | null;
  fatigue: number | null;
  /** Note of the action (what an "other" action was...). */
  description?: string | null;
  /** Spell of a `cast_spell` action (spec 030). */
  spell?: ActionSpell | null;
};

// --- Spell casting (spec 030) ---

export type SpellRealm = 'channeling' | 'essence' | 'mentalism';
export type SpellCastResult = 'success' | 'no-effect' | 'failure';
export type SpellFailurePp = 'none' | 'one' | 'half-down' | 'half-up' | 'normal' | 'double' | 'triple' | 'all';
export const SPELL_HANDS = ['none', 'one', 'two'] as const;
export const SPELL_VOICES = ['none', 'whisper', 'normal', 'shout'] as const;
export const SPELL_HELMETS = ['none', 'light', 'medium', 'heavy'] as const;
export const SPELL_ARMORS = ['none', 'leather', 'metal'] as const;

export type SpellOptions = {
  subtle: boolean;
  hands: (typeof SPELL_HANDS)[number];
  voice: (typeof SPELL_VOICES)[number];
  helmet: (typeof SPELL_HELMETS)[number];
  armor: (typeof SPELL_ARMORS)[number];
  armorEncumbrance: number;
  preparationRounds: number;
  customBonus: number;
};

export const DEFAULT_SPELL_OPTIONS: SpellOptions = {
  subtle: false,
  hands: 'two',
  voice: 'normal',
  helmet: 'none',
  armor: 'none',
  armorEncumbrance: 0,
  preparationRounds: 0,
  customBonus: 0,
};

export type SpellRollModifier = { key: string; value: number };

export type SpellTargetConditions = {
  willing?: boolean;
  surprisedOrStunned?: boolean;
  cover?: 'none' | 'partial' | 'full';
  armor?: 'none' | 'organic' | 'metal';
  helmet?: 'none' | 'organic' | 'metal';
  range?: 'touch' | 'close' | 'normal' | 'far';
};

export type ActionSpellTarget = {
  actorId: string;
  actorName?: string | null;
  rolled: boolean;
  roll: number | null;
  conditions: SpellTargetConditions;
  breakdown: SpellRollModifier[];
  total: number | null;
  required: number;
  resisted: boolean;
  failure: number;
};

export type ActionSpell = {
  spell: {
    spellId: string;
    name: string;
    level: number;
    typeCode: string | null;
    type: 'elemental' | 'force' | 'informational' | 'utility';
    subtype: string | null;
    instant: boolean;
    powerPoints: number;
    listCode: string;
    listName: string | null;
    listRealms: SpellRealm[];
    resistance: { kind: string; modifier: number | null; scaling: string | null } | null;
    duration: Record<string, unknown> | null;
    effects: Record<string, unknown>[];
  };
  caster: {
    realms: SpellRealm[];
    realmStatBonus: number;
    level: number;
    listSkillId: string;
    ranks: number;
    listTypeModifier: number;
  };
  options?: SpellOptions;
  roll?: { modifiers: SpellRollModifier[]; roll: number; totalRoll: number };
  result?: SpellCastResult;
  failure?: {
    realm: SpellRealm;
    roll: number;
    modifier: number;
    total: number;
    text: string;
    suggestedPp: SpellFailurePp;
  };
  targets?: ActionSpellTarget[];
  powerPointsSpent?: number | null;
  /** Attack of a bolt or ball spell, resolved with the attack flow (spec 030, phase 4). */
  attack?: ActionSpellAttack | null;
};

export type ActionSpellAttack = {
  kind: 'bolt' | 'ball';
  attackName: string;
  attackTable: string;
  attackSize: number;
  criticalType: string;
  fumbleTable: string;
  fumble: number;
  bo: number;
  skillId: string | null;
  ranges: { from: number; to: number; bonus: number }[];
  radius: number | null;
};

export type SpellPreview = {
  modifiers: SpellRollModifier[];
  bonus: number;
  needsPreparation: boolean;
  actionPoints: number;
};

export type SpellTargetRoll = { actorId: string; roll?: number; conditions?: SpellTargetConditions; bonus?: number };

export type ResolveMovementDto = {
  phase: number;
  pace: string;
  requiredManeuver: boolean;
  difficulty: string;
  skillId: string;
  roll: number | null;
};

export type ActionAttack = {
  attackName: string;
  /** Set by the API; absent in attacks built by the UI before prepare. */
  type?: AttackType;
  modifiers: ActionAttackModifiers;
  roll: ActionAttackRoll | null;
  calculated: AttackCalculationsDto | null;
  results: ActionAttackResults | null;
  /** Set by the API; absent in attacks built by the UI before prepare and in actions stored before the per-attack status. */
  status?: AttackStatus;
  protectors: string[] | null;
  /** Where each protector stands (Table 9-7c), by actor id; `other` when not given. Sent on prepare. */
  protectorPositions?: Record<string, ProtectPosition>;
};

/** Where a protector stands (Table 9-7c): between attacker and defender, behind the defender, or anywhere else. */
export type ProtectPosition = 'protector_between' | 'defender_between' | 'other';
export const PROTECT_POSITIONS: ProtectPosition[] = ['protector_between', 'defender_between', 'other'];

/** Full defence of a completed dodge action (4 AP): a full dodge or a full block. */
export type FullDefenseType = 'dodge' | 'block';

export type ActionAttackRoll = {
  roll: number | null;
  /** The criticals of an attack share one roll (§9.8): the API stores it under every critical key. */
  criticalRolls?: Record<string, number | null>;
  fumbleRoll?: number | null;
};

export type ActionAttackResults = {
  attackTableEntry: AttackTableEntry | null;
  criticals?: Critical[];
  fumble?: ActionAttackFumbleResult;
};

export type Critical = {
  key: string;
  status: string;
  criticalType: string;
  criticalSeverity: string;
  adjustedRoll?: number;
  result?: CriticalResult;
  /** Fighting style ability that changed the critical before the roll (spec 032). */
  styleOption?: CriticalStyleOption;
};

export type CriticalStyleOption = { abilityId: string; originalType: string; originalSeverity: string };

export type CriticalResult = {
  text: string;
  damage: number;
  location: string;
  effects: CriticalEffect[];
};

export type CriticalEffect = {
  status: string;
  value?: number | null;
  rounds?: number | null;
  /** Rounds before the effect starts. */
  delay?: number | null;
  condition?: string | null;
  /** Limb of a `limb_useless` effect (`arm`, `leg`), spec 034. */
  location?: string | null;
  /** Severity of the `additional_critical` of a fumble, spec 034. */
  severity?: string | null;
  /** Dice of the value (`2d10`): the hits of a fumble, the distance of a knock back (spec 034). */
  dice?: string | null;
};

export type AttackTableEntry = {
  damage: number;
  text: string;
  criticalType?: string | null;
  criticalSeverity?: string | null;
};

export type ActionAttackFumbleResult = {
  status: string;
  text?: string | null;
  additionalDamageText?: string | null;
  damage?: number | null;
  effects?: CriticalEffect[];
};

export type ActionAttackModifiers = {
  targetId: string;
  bo: number | null;
  calledShot: string | null;
  calledShotPenalty: number | null;
  cover?: string;
  restrictedQuarters?: string;
  positionalSource?: string;
  positionalTarget?: string;
  pace?: string;
  higherGround?: boolean;
  stunnedFoe?: boolean;
  surprisedFoe?: boolean;
  proneSource?: boolean;
  offHand?: boolean;
  proneTarget?: boolean;
  attackerInMelee?: boolean;
  ambush?: boolean;
  range?: number | null;
  disabledDB: boolean | null;
  disabledShield: boolean | null;
  disabledParry: boolean | null;
  restrictedParry: boolean | null;
  customBonus: number | null;
  chargeSpeed?: ChargeSpeed;
  /** Fighting style ability that changes the critical (spec 032). */
  styleCriticalOption?: string | null;
};

export type AttackCalculationsDto = {
  rollModifiers: KeyValueModifier[];
  rollTotal: number;
  /** Fumble range used for the roll (weapon fumble plus traits such as Foiler). */
  fumble?: number;
  /** Location hit by a called shot; without one no location is rolled (the AT is the torso's). */
  location: string | null;
  /** Modifiers applied to the critical rolls (size difference, absolute hit...). */
  criticalModifiers?: KeyValueModifier[];
  /** Sum of `criticalModifiers`. */
  criticalAdjustment?: number | null;
  /** The attack roll triggered a weapon breakage check. */
  breakageRoll?: boolean | null;
};

export type ActionParry = {
  id: string;
  actorId: string;
  targetActorId: string;
  parryType: 'parry' | 'protect' | undefined;
  targetAttackName: string | undefined;
  parryAvailable: number;
  parry: number;
  /** Protect penalty left after the Protect skill (0 or negative), spent from the protector's OB when it protects. */
  penalty?: number;
  protectPosition?: ProtectPosition;
  /** Parry declared against this attacker in an earlier action of the round: fixed, its OB is not spent again. */
  carriedOver?: boolean;
};
