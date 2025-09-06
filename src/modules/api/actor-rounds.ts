import { buildErrorFromResponse } from './api-errors';

export type ActorRound = {
  id: number;
  [key: string]: any;
};

export async function fetchActorRounds(gameId: number, round: number): Promise<ActorRound[]> {
  const rsql = `gameId==${gameId};round==${round}`;
  const url = `${process.env.RMU_API_TACTICAL_URL}/actor-rounds?q=${rsql}&page=0&size=100`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const json = await response.json();
  return json.content;
}

export async function declareActorRoundInitiative(actorRoundId: number, roll: number): Promise<ActorRound> {
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
