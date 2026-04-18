import { KeyValue } from '@labcabrera-rmu/rmu-react-shared-lib';

export type ActionStatus =
  | 'declared'
  | 'prepared'
  | 'parry'
  | 'parry_declaration'
  | 'pending_attack_roll'
  | 'roll_declaration'
  | 'critical_and_fumble_roll_declaration'
  | 'pending_apply'
  | 'completed';
export type ActionType = 'movement' | 'melee_attack' | 'ranged_attack' | 'maneuver' | 'skill' | 'free';
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

export type KeyValueModifier = {
  key: string;
  value: number;
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
  modifiers: ActionAttackModifiers;
  roll: ActionAttackRoll | null;
  calculated: AttackCalculationsDto | null;
  results: ActionAttackResults | null;
  status: string;
};

export type ActionAttackRoll = {
  roll: number | null;
  locationRoll: number | null;
  criticalRolls?: Map<string, number | null>;
  fumbleRoll?: number | null;
};

export type ActionAttackResults = {
  attackTableEntry: AttackTableEntry | null;
  criticals: Critical[];
  fumble: any;
  attackTableResult: string;
};

export type Critical = {
  key: string;
  status: string;
  criticalType: string;
  criticalSeverity: number;
  adjustedRoll: number;
  result: CriticalResult;
};

export type CriticalResult = {
  text: string;
};

export type AttackTableEntry = {
  damage: number;
  text: string;
};

export type ActionAttackFumbleResult = {
  status: string;
  text: string | null;
  additionalDamageText: string | null;
  damage: number | null;
  effects: any[] | undefined;
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
  dodge?: string;
  range?: number | null;
  disabledDB: boolean | null;
  disabledShield: boolean | null;
  disabledParry: boolean | null;
  restrictedParry: boolean | null;
  customBonus: number | null;
};

export type AttackCalculationsDto = {
  rollModifiers: KeyValueModifier[];
  rollTotal: number;
  requiredLocationRoll: boolean;
  location: string | null;
};

export type ActionParry = {
  id: string;
  actorId: string;
  targetActorId: string;
  parryType: 'parry' | 'protect' | undefined;
  targetAttackName: string | undefined;
  parryAvailable: number;
  parry: number;
};

export type DeclareParryDto = {
  parries: DeclareParryItemDto[];
};

export type DeclareParryItemDto = {
  parryActorId: string;
  targetId: string;
  parry: number;
};
