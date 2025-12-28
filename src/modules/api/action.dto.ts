export type ActionStatus =
  | 'declared'
  | 'in_progress'
  | 'parry_declaration'
  | 'roll_declaration'
  | 'critical_and_fumble_roll_declaration'
  | 'pending_apply'
  | 'completed';

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

export type RollModifier = {
  key: string;
  value: number;
};

export type ActionRoll = {
  modifiers?: RollModifier[];
  roll: number | null;
  totalRoll?: number;
};

export type ActionMovement = {
  modifiers: ActionMovementModifiers;
  roll: ActionRoll;
  calculated?: ActionMovementCalculated;
};

export type Action = {
  id: string;
  gameId: string;
  actorId: string;
  round: number;
  actionType: 'movement' | 'melee-attack' | 'ranged-attack' | 'skill' | 'free';
  phaseStart: number;
  phaseEnd: number | undefined;
  status: ActionStatus;
  actionPoints: number | undefined;
  movement: ActionMovement | undefined;
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
  modifiers: ActionAttackModifiers;
  roll: {
    roll: number | null;
    location: string | null;
    criticalRolls?: Map<string, number | undefined>;
  };
  calculated: AttackCalculationsDto | undefined;
  results: any;
};

export type ActionAttackModifiers = {
  attackName: string;
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
  ambush?: boolean;
  dodge?: string;
  range?: number | null;
  disabledDB: boolean | null;
  disabledShield: boolean | null;
  disabledParry: boolean | null;
  customBonus: number | null;
};

export type AttackCalculationsDto = {
  rollModifiers: { key: string; value: number }[];
  rollTotal: number;
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
