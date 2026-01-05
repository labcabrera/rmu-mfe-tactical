export type ActorRound = {
  id: string;
  gameId: string;
  actorId: string;
  actorName: string;
  round: number;
  initiative: ActorRoundInitiative;
  actionPoints: number;
  hp: ActorRoundHp;
  fatigue: ActorRoundFatigue;

  effects: ActorRoundEffect[];
  defense: ActorRoundDefense;
  imageUrl: string | undefined;
  [key: string]: any;
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
};

export type ActorRoundEffect = {
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
  attackSize: string;
  fumble: number;
  canThrow: boolean;
  ranges: ActorRoundAttackRange[] | undefined;
};

export type ActorRoundAttackRange = {
  from: number;
  to: number;
  bonus: number;
};
