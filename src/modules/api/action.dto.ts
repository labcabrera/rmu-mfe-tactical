export type ActionStatus =
  | 'declared'
  | 'in_progress'
  | 'parry_declaration'
  | 'roll_declaration'
  | 'critical_and_fumble_roll_declaration'
  | 'pending_apply'
  | 'completed';

export type Action = {
  id: string;
  gameId: string;
  actorId: string;
  round: number;
  actionType: 'movement' | 'attack' | 'skill' | 'free';
  phaseStart: number;
  phaseEnd: number | undefined;
  status: ActionStatus;
  actionPoints: number | undefined;
  attacks: ActionAttack[] | undefined;
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
  attacks: AttackDeclarationItemDto[];
  parries: AttackParryDto[];
};

export type AttackDeclarationItemDto = {
  modifiers: AttackModifiersDto;
  parries: AttackParryDto[];
  roll: {
    roll: number | null;
    location: string | null;
    criticalRolls?: Map<string, number | undefined>;
  };
  calculated: AttackCalculationsDto | undefined;
  results: any;
};

export type AttackModifiersDto = {
  attackName: string;
  targetId: string;
  bo: number | null;
  calledShot: string | null;
  calledShotPenalty: number | null;
  cover?: string;
  restrictedQuarters?: string;
  positionalSource?: string;
  positionalTarget?: string;
  dodge?: string;
  range?: number | null;
  disabledDB: boolean | null;
  disabledShield: boolean | null;
  disabledParry: boolean | null;
  customBonus: number | null;
};

export type AttackDeclarationDto = {
  attacks: AttackModifiersDto[];
  parries: AttackParryDto[];
};

export type AttackCalculationsDto = {
  rollModifiers: { key: string; value: number }[];
  rollTotal: number;
};

export type AttackParryDto = {
  parryActorId: string;
  targetId: string;
  parryType: 'parry' | 'protect' | undefined;
  parryAvailable: number | undefined;
  parry: number | undefined;
};

export type DeclareParryDto = {
  parries: DeclareParryItemDto[];
};

export type DeclareParryItemDto = {
  parryActorId: string;
  targetId: string;
  parry: number;
};
