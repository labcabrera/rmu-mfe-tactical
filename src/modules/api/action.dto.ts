import { KeyValue } from '@labcabrera-rmu/rmu-react-shared-lib';

// Same values as rmu-api-tactical (action-status.vo.ts). `pending_roll` is the current status while the attack,
// critical or fumble rolls are pending: each attack's `status` says which roll it waits for.
// `pending_attack_roll` and `critical_or_fumble_roll` are the older statuses, still present in stored actions.
export type ActionStatus =
  | 'declared'
  | 'prepared'
  | 'parry'
  | 'pending_roll'
  | 'pending_attack_roll'
  | 'critical_or_fumble_roll'
  | 'pending_apply'
  | 'completed';

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
};

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

export type ActionManeuverModifiers = {
  skillId: string | null;
  maneuverType: string | null;
  difficulty: string | null;
  lightModifier: string | null;
  light: string | null;
  customBonus: number | null;
};

export type ActionManeuverResult = {
  result: string;
  message: string;
};

export type ActionManeuver = {
  modifiers: ActionManeuverModifiers;
  roll: ActionRoll | undefined;
  result: ActionManeuverResult | undefined;
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
  actionPoints: number | null;
  movement: ActionMovement | null;
  maneuver: ActionManeuver | null;
  attacks: ActionAttack[] | null;
  parries: ActionParry[] | null;
  fatigue: number | null;
  /** Note of the action (what an "other" action was...). */
  description?: string | null;
};

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
};

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
