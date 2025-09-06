import { buildErrorFromResponse } from './api-errors';

export type Faction = {
  id: string;
  [key: string]: any;
};

export async function fetchFaction(factionId: string): Promise<Faction> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/factions/${factionId}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function fetchFactions(rsql: string, page: number, size: number): Promise<Faction[]> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/factions?q=${rsql}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const pageContent = await response.json();
  return pageContent.content;
}
