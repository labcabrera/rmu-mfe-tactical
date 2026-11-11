import { AuthContextProps } from 'react-oidc-context';
import { apiTacticalUrl, callApi } from '@labcabrera-rmu/rmu-react-shared-lib';
import { FearEaseResult, GameSide, TacticalGameWithSides } from './tactical-game-sides.dto';

/**
 * Sets every side of a `created` game at once (workspace spec 100), for the game master. Errors: `err-sides-locked`,
 * `err-sides-invalid`, `err-side-leader-invalid` and `version-conflict`.
 */
export async function putTacticalGameSides(
  gameId: string,
  sides: GameSide[],
  version: number | undefined,
  auth: AuthContextProps
): Promise<TacticalGameWithSides> {
  const url = `${apiTacticalUrl}/tactical-games/${gameId}/sides`;
  return await callApi(auth, url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(version === undefined ? { sides } : { sides, version }),
  });
}

/** Lifts the balk and retreat of the standing members of a side that won the round (workspace spec 100). */
export async function easeSideFear(gameId: string, sideId: string, auth: AuthContextProps): Promise<FearEaseResult> {
  const url = `${apiTacticalUrl}/tactical-games/${gameId}/fear-ease`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sideId }),
  });
}
