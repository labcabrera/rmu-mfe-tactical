import { getAuthHeaders } from '../services/auth-token-service';
import { apiStrategicUrl } from '../services/config';
import { buildErrorFromResponse } from './api-errors';
import { Page } from './common.dto';
import { StrategicItem } from './strategic-item.dto';

export async function fetchStrategicItem(itemId: string): Promise<StrategicItem> {
  const url = `${apiStrategicUrl}/items/${itemId}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function fetchStrategicItems(rsql: string, page: number, size: number): Promise<Page<StrategicItem>> {
  const url = `${apiStrategicUrl}/items?q=${rsql}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}
