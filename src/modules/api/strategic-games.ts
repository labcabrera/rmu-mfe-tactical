import { buildErrorFromResponse } from './api-errors';

export type StrategicGame = {
  id: number;
  [key: string]: any;
};

export async function fetchStrategicGames(rsql: string, page: number, size: number): Promise<StrategicGame[]> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/strategic-games?q=${rsql}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const pageContent = await response.json();
  return pageContent.content;
}

export async function fetchStrategicGame(gameId: string): Promise<StrategicGame> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/strategic-games/${gameId}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}
