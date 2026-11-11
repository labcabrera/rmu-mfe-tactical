import { AuthContextProps } from 'react-oidc-context';
import { apiTacticalUrl, callApi, TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';

/** Adds several characters to the game in one call (spec 027). */
export async function addGameCharacters(
  gameId: string,
  characterIds: string[],
  auth: AuthContextProps
): Promise<TacticalGame> {
  const url = `${apiTacticalUrl}/tactical-games/${gameId}/actors`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actors: characterIds.map((id) => ({ id, type: 'character' })) }),
  });
}

/** Removes several actors from the game in one call. The API only allows it while the game is `created`. */
export async function deleteGameActors(
  gameId: string,
  actorIds: string[],
  auth: AuthContextProps
): Promise<TacticalGame> {
  const url = `${apiTacticalUrl}/tactical-games/${gameId}/actors`;
  return await callApi(auth, url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actors: actorIds }),
  });
}
