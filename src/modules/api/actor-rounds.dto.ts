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
  defense: ActorRoundDefense;
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
  total: number;
};

export type ActorRoundHp = {
  max: number;
  current: number;
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
};

export type ActorRoundDefenseShield = {
  db: number;
};

export type ActorRoundEffect = {
  id: string;
  status: string;
  value: number | undefined;
  rounds: number | undefined;
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
};

export type ActorRoundAttackRange = {
  from: number;
  to: number;
  bonus: number;
};
