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
  owner: string;
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

export type CreateTacticalGameDto = Omit<
  TacticalGame,
  'id' | 'status' | 'round' | 'phase' | 'factions' | 'actors' | 'owner'
>;

export type UpdateTacticalGameDto = Partial<
  Omit<TacticalGame, 'id' | 'strategicGameId' | 'status' | 'round' | 'phase' | 'factions' | 'actors' | 'owner'>
>;

export const emptyTacticalGame: TacticalGame = {
  id: '',
  strategicGameId: '',
  name: '',
  status: '',
  round: 0,
  phase: '',
  factions: [],
  actors: [],
  environment: { temperatureFatigueModifier: 0, altitudeFatigueModifier: 0 },
  description: '',
  imageUrl: '',
  owner: '',
};
