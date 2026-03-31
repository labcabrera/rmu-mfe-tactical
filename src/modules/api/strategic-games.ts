import { getAuthHeaders } from '../services/auth-token-service';
import { apiStrategicUrl } from '../services/config';
import { buildErrorFromResponse } from './api-errors';

export type StrategicGame = {
  id: string;
  name: string;
};

export async function fetchStrategicGames(rsql: string, page: number, size: number): Promise<StrategicGame[]> {
  const url = `${apiStrategicUrl}/strategic-games?q=${rsql}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const pageContent = await response.json();
  return pageContent.content;
}

export async function fetchStrategicGame(gameId: string): Promise<StrategicGame> {
  const url = `${apiStrategicUrl}/strategic-games/${gameId}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}
