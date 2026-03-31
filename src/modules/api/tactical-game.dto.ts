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
  description: string;
  imageUrl?: string;
};

export type ActorRound = {
  id: string;
  actorId: string;
};

export type TacticalGameEnvironment = {
  temperatureFatigueModifier: number;
  altitudeFatigueModifier: number;
};

export type CreateTacticalGameDto = Omit<TacticalGame, 'id' | 'status' | 'round' | 'phase' | 'factions' | 'actors'>;

export type UpdateTacticalGameDto = Partial<Omit<CreateTacticalGameDto, 'strategicGameId'>>;
