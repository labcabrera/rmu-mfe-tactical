export type ActorRound = {
  id: string;
  gameId: string;
  factionId: string;
  actorId: string;
  actorName: string;
  round: number;
  movement: ActorRoundMovement;
  initiative: ActorRoundInitiative;
  actionPoints: number;
  hp: ActorRoundHp;
  fatigue: ActorRoundFatigue;
  penalty: ActorRoundPenalty;
  attacks: ActorRoundAttack[];
  effects: ActorRoundEffect[];
  /** Combat traits of the actor (talents and flaws) copied from its character (absent in older actor rounds). */
  traits?: ActorRoundTrait[];
  defense: ActorRoundDefense;
  /** Dodge and shield block declared this round (absent in actor rounds stored before them). */
  defenseMode?: ActorRoundDefenseMode;
  /** Action points spent in each action phase that has ended. */
  phaseLog?: ActorRoundPhaseLog[];
  /** Modifiers of the AP capacity, with their origin (spec 011, §1). */
  apModifiers?: ActorRoundApModifier[];
  /** AP of each action phase, index 0 is phase 1. */
  apCapacity?: number[];
  /** AP spent, lost or used by instantaneous actions, by phase and action (spec 011, §2). */
  apLedger?: ActorRoundApLedgerEntry[];
  alerts: ActorRoundAlert[];
  imageUrl: string | undefined;
};

export type ActorRoundMovement = {
  bmr: number;
  penalty: number;
  maxPace: string;
  baseDifficulty: string;
};

export type ActorRoundPenaltyModifier = {
  id: string;
  source: string;
  value: number;
};

export type ActorRoundPenalty = {
  modifiers: ActorRoundPenaltyModifier[] | undefined;
};

export type ActorRoundInitiative = {
  base: number;
  penalty: number;
  roll: number;
  /** Strike Reflex bonus declared with the roll, already included in the total. */
  strikeReflex?: number;
  /** Reflexes bonus (spec 011), already included in the total. */
  reflexes?: number;
  total: number;
};

export type ApModifierKind = 'bonus' | 'loss' | 'cap' | 'cost-multiplier';

/** A change to the AP capacity of the round: AP gained or lost, a cap, or a cost multiplier. */
export type ActorRoundApModifier = {
  source: string;
  kind: ApModifierKind;
  value: number;
  /** Phase of a loss that falls in a given phase (staggered). */
  phase?: number;
  effectId?: string;
};

export type ApLedgerKind = 'spent' | 'lost' | 'instant';

export type ActorRoundApLedgerEntry = {
  phase: number;
  actionId?: string;
  ap: number;
  kind: ApLedgerKind;
};

/** Effects that change the action points of the round (spec 011), with the values `POST /effects` accepts. */
export const AP_EFFECTS: { status: string; defaultValue: number; min: number; max: number }[] = [
  { status: 'staggered', defaultValue: 1, min: 1, max: 4 },
  { status: 'haste', defaultValue: 1, min: 1, max: 4 },
  { status: 'speed', defaultValue: 1, min: 1, max: 4 },
  { status: 'reflexes', defaultValue: 1, min: 1, max: 3 },
  { status: 'adrenal-speed', defaultValue: 2, min: 1, max: 4 },
  { status: 'hold', defaultValue: 3, min: 1, max: 4 },
  { status: 'distraction', defaultValue: 1, min: 1, max: 3 },
  { status: 'ap-cap', defaultValue: 2, min: 0, max: 8 },
  { status: 'manual', defaultValue: 1, min: -8, max: 8 },
];

export type ActorRoundTrait = {
  traitId: string;
  tier: number;
  specialization: string | null;
};

export type ActorRoundHp = {
  max: number;
  current: number;
  /** Hits below zero the actor survives (Body Development bonus); `max` when missing. */
  deathThreshold?: number;
};

/** Dodge or shield block level (§9.6). `full` is only set by completing a 4 AP dodge action. */
export type DefenseLevel = 'none' | 'passive' | 'partial' | 'full';
/** Levels the game master declares directly. */
export const DECLARABLE_DEFENSE_LEVELS: DefenseLevel[] = ['none', 'passive', 'partial'];

export type ActorRoundDefenseMode = {
  dodge: DefenseLevel;
  block: DefenseLevel;
};

export type ActorRoundPhaseLog = {
  phase: number;
  spentAp: number;
  totalSpentAp: number;
};

export type ActorRoundAlert = {
  id: string;
  type: string;
  value: string;
};

export type ActorRoundFatigue = {
  endurance: number;
  fatigue: number;
  accumulator: number;
};

export type ActorRoundDefense = {
  bd: number;
  at: number | undefined;
  headAt: number | undefined;
  bodyAt: number | undefined;
  armsAt: number | undefined;
  legsAt: number | undefined;
  shield: ActorRoundDefenseShield | null;
  protect: number;
};

export type ActorRoundDefenseShield = {
  db: number;
};

export type ActorRoundEffect = {
  id: string;
  status: string;
  value: number | undefined;
  rounds: number | undefined;
  /** Foe the effect refers to (the target of `pressing-advantage`). */
  targetActorId?: string;
  /** Round and phase the effect was applied in, and the AP the actor had spent before it (set by the API). */
  appliedRound?: number;
  appliedPhase?: number;
  spentApBefore?: number;
};

export type ActorRoundAttack = {
  attackName: string;
  baseBo: number;
  currentBo: number;
  type: 'melee' | 'ranged';
  attackTable: string;
  fumbleTable: string;
  attackSize: number;
  fumble: number;
  canThrow: boolean;
  ranges: ActorRoundAttackRange[] | undefined;
  twoHanded?: boolean;
  weaponCategory?: WeaponCategory;
};

/** Weapon kind for the multiple attacks bonuses (Table 9-7b). */
export type WeaponCategory = 'standard' | 'light' | 'dagger' | 'natural';

export type ActorRoundAttackRange = {
  from: number;
  to: number;
  bonus: number;
};
