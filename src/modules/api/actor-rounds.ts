import { buildErrorFromResponse } from './api-errors';

export type ActorRound = {
  id: string;
  actorName: string;
  effects: ActorRoundEffect[];
  [key: string]: any;
};

export type ActorRoundEffect = {
  status: string;
  value: number | undefined;
  rounds: number | undefined;
};

export async function fetchActorRounds(gameId: string, round: number): Promise<ActorRound[]> {
  const rsql = `gameId==${gameId};round==${round}`;
  const url = `${process.env.RMU_API_TACTICAL_URL}/actor-rounds?q=${rsql}&page=0&size=100`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const json = await response.json();
  return json.content;
}

export async function declareActorRoundInitiative(actorRoundId: string, roll: number): Promise<ActorRound> {
  const url = `${process.env.RMU_API_TACTICAL_URL}/actor-rounds/${actorRoundId}/initiative`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ roll }),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function addActorRoundHp(actorRoundId: string, hp: number): Promise<ActorRound> {
  const url = `${process.env.RMU_API_TACTICAL_URL}/actor-rounds/${actorRoundId}/add-hp/${hp}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}
