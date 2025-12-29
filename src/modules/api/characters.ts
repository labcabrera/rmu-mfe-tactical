import { buildErrorFromResponse } from './api-errors';
import { Character } from './characters.dto';

export async function fetchCharacter(characterId: string): Promise<Character> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function fetchCharacters(rsql: string, page: number, size: number): Promise<Character[]> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters?q=${rsql}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const pageContent = await response.json();
  return pageContent.content;
}

export type CharacterSize = {
  id: number;
  [key: string]: any;
};

export async function fetchCharacterSizes(): Promise<CharacterSize[]> {
  const url = `${process.env.RMU_API_CORE_URL}/character-sizes`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}
