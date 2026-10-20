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
  total: number;
};

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
