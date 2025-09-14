export type ActorRound = {
  id: string;
  actorName: string;
  effects: ActorRoundEffect[];
  defense: ActorRoundDefense;
  [key: string]: any;
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
