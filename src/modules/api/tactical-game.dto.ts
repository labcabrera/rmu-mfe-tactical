export type TacticalGame = {
  id: string;
  strategicGameId: string;
  name: string;
  status: string;
  round: number;
  phase: string;
  factions: string[];
  actors: ActorRound[];
  environment: TacticalGameEnvironment;
};

export type ActorRound = {
  id: string;
  actorId: string;
};

export type TacticalGameEnvironment = {
  temperatureFatigueModifier: number;
  altitudeFatigueModifier: number;
};

export type CreateTacticalGameDto = {
  strategicGameId: string;
  name: string;
  environment: CreateTacticalGameEnvironmentDto | undefined;
  description?: string;
};

export type CreateTacticalGameEnvironmentDto = {
  temperatureFatigueModifier: number | undefined;
  altitudeFatigueModifier: number | undefined;
};

export type UpdateTacticalGameDto = {
  name: string | undefined;
  description: string | undefined;
};
