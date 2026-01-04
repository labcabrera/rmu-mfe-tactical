export type ActionStatus =
  | 'declared'
  | 'prepared'
  | 'parry'
  | 'parry_declaration'
  | 'roll_declaration'
  | 'critical_and_fumble_roll_declaration'
  | 'pending_apply'
  | 'completed';

export type ActionType = 'movement' | 'melee_attack' | 'ranged_attack' | 'maneuver' | 'skill' | 'free';

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
  skillId?: string;
  difficulty?: string;
  customModifier?: number;
};

export type ActionMovementCalculated = {
  bmr: number;
  paceMultiplier: number;
  percent: number;
  distance: number;
  distanceAdjusted: number;
  description: string;
};

export type KeyValueModifier = {
  key: string;
  value: number;
};

export type ActionRoll = {
  modifiers?: KeyValueModifier[];
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
  customModifier: number | null;
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
  phaseEnd: number | undefined;
  status: ActionStatus;
  actionPoints: number | undefined;
  movement: ActionMovement | undefined;
  maneuver: ActionManeuver | undefined;
  attacks: ActionAttack[] | undefined;
  parries: ActionParry[] | undefined;
  fatigue: number | undefined;
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
  roll: {
    roll: number | null;
    locationRoll: number | null;
    criticalRolls?: Map<string, number | undefined>;
    fumbleRoll?: number | null;
  };
  calculated: AttackCalculationsDto | undefined;
  results: ActionAttackResults | undefined;
  status: string;
};

export type ActionAttackResults = {
  attackTableEntry: any;
  criticals: any[];
  fumble: any;
  attackTableResult: string;
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
