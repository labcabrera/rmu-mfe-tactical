export type TacticalGame = {
  id: string;
  strategicGameId: string;
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
  temperatureFatiguePenalty: number;
  altitudeFatiguePenalty: number;
};

export type CreateTacticalGameDto = {
  strategicGameId: string;
  name: string;
  environment: CreateTacticalGameEnvironmentDto | undefined;
  description?: string;
};

export type CreateTacticalGameEnvironmentDto = {
  temperatureFatiguePenalty: number | undefined;
  altitudeFatiguePenalty: number | undefined;
};

export type UpdateTacticalGameDto = {
  name: string | undefined;
  description: string | undefined;
};
