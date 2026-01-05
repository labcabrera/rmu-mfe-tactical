import { buildErrorFromResponse } from './api-errors';

export type TacticalGame = {
  id: string;
  strategicGameId: string;
  status: string;
  phase: string;
  [key: string]: any;
};

export type CreateTacticalGameDto = {
  strategicGameId: string;
  name: string;
  description?: string;
  [key: string]: any;
};

export type UpdateTacticalGameDto = {
  name: string | undefined;
  description: string | undefined;
};

export function getPhaseAsNumber(game: TacticalGame): number | undefined {
  if (!game) return undefined;
  const phase = game?.phase;
  if (!phase || typeof phase !== 'string') return undefined;
  const prefix = 'phase_';
  if (!phase.startsWith(prefix)) return undefined;
  const numStr = phase.slice(prefix.length);
  if (!numStr) return undefined;
  const num = Number(numStr);
  if (!Number.isFinite(num) || !Number.isInteger(num)) return undefined;
  return num;
}

export async function fetchTacticalGames(rsql: string, page: number, size: number): Promise<TacticalGame[]> {
  const url = `${process.env.RMU_API_TACTICAL_URL}/tactical-games?q=${rsql}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const pageContent = await response.json();
  return pageContent.content;
}

export async function fetchTacticalGame(gameId: string): Promise<TacticalGame> {
  const url = `${process.env.RMU_API_TACTICAL_URL}/tactical-games/${gameId}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function createTacticalGame(gameData: any): Promise<TacticalGame> {
  const url = `${process.env.RMU_API_TACTICAL_URL}/tactical-games`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(gameData),
  });
  if (response.status !== 201) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function updateTacticalGame(gameId: string, gameData: any): Promise<TacticalGame> {
  const url = `${process.env.RMU_API_TACTICAL_URL}/tactical-games/${gameId}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(gameData),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function deleteTacticalGame(gameId: string): Promise<boolean> {
  const url = `${process.env.RMU_API_TACTICAL_URL}/tactical-games/${gameId}`;
  const response = await fetch(url, { method: 'DELETE' });
  if (response.status !== 204) {
    throw await buildErrorFromResponse(response, url);
  }
  return true;
}

export async function addFaction(gameId: string, factionId: string): Promise<TacticalGame> {
  const url = `${process.env.RMU_API_TACTICAL_URL}/tactical-games/${gameId}/factions`;
  const data = { factions: [factionId] };
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function deleteFaction(gameId: string, factionId: string): Promise<TacticalGame> {
  const url = `${process.env.RMU_API_TACTICAL_URL}/tactical-games/${gameId}/factions`;
  const data = { factions: [factionId] };
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function addActor(gameId: string, actorId: string, type: string): Promise<TacticalGame> {
  const request = { actors: [{ id: actorId, type }] };
  const url = `${process.env.RMU_API_TACTICAL_URL}/tactical-games/${gameId}/actors`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function deleteActor(gameId: string, actorId: string): Promise<TacticalGame> {
  const data = { actors: [actorId] };
  const url = `${process.env.RMU_API_TACTICAL_URL}/tactical-games/${gameId}/actors`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function startRound(gameId: string): Promise<TacticalGame> {
  const url = `${process.env.RMU_API_TACTICAL_URL}/tactical-games/${gameId}/rounds/start`;
  const response = await fetch(url, { method: 'POST' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function startPhase(gameId: string): Promise<TacticalGame> {
  const url = `${process.env.RMU_API_TACTICAL_URL}/tactical-games/${gameId}/phases/start`;
  const response = await fetch(url, { method: 'POST' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function randomizeInitiatives(gameId: string): Promise<TacticalGame> {
  const url = `${process.env.RMU_API_TACTICAL_URL}/tactical-games/${gameId}/initiatives/randomize`;
  const response = await fetch(url, { method: 'POST' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}
