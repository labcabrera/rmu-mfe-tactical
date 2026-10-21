import { AuthContextProps } from 'react-oidc-context';
import { apiTacticalUrl, callApi, Page } from '@labcabrera-rmu/rmu-react-shared-lib';
import {
  Action,
  AttackDeclaration,
  FullDefenseType,
  ManeuverModifiersListing,
  ParryDeclaration,
  ResolveManeuverDto,
} from './action.dto';

export async function fetchAction(actionId: string, auth: AuthContextProps): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchActions(
  rsql: string | undefined,
  page: number,
  size: number,
  auth: AuthContextProps
): Promise<Page<Action>> {
  const url = `${apiTacticalUrl}/actions?q=${rsql || ''}&page=${page}&size=${size}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchActionsByGameAndRound(
  gameId: string,
  round: number,
  auth: AuthContextProps
): Promise<Action[]> {
  const url = `${apiTacticalUrl}/actions?q=gameId==${gameId};round==${round}&size=1000`;
  const res = await callApi(auth, url, { method: 'GET' });
  // The backend may return either an array of actions or a paged response { content: Action[] }
  // Normalize to always return the array of actions.
  if (Array.isArray(res)) return res as Action[];
  if (res && (res as any).content) return (res as any).content as Action[];
  return [];
}

export async function createAction(actionData: any, auth: AuthContextProps): Promise<Action> {
  const url = `${apiTacticalUrl}/actions`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(actionData),
  });
}

export async function deleteAction(actionId: string, auth: AuthContextProps): Promise<boolean> {
  const url = `${apiTacticalUrl}/actions/${actionId}`;
  return await callApi(auth, url, { method: 'DELETE' });
}

export async function resolveMovement(actionId: string, data: any, auth: AuthContextProps): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/movement/resolve`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/**
 * Completes an action without rolls (stand up, dodge, draw and load, other), with an optional note. A dodge is the
 * 4 AP full defence of the round: `defenseType` says whether it is a full dodge or a full block.
 */
export async function completeAction(
  actionId: string,
  note: string | undefined,
  auth: AuthContextProps,
  defenseType?: FullDefenseType
): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/complete`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note, defenseType }),
  });
}

/** Modifiers a declared maneuver can take, optionally for another skill than the declared one. */
export async function fetchActionManeuverModifiers(
  actionId: string,
  auth: AuthContextProps,
  skillId?: string,
  specialization?: string
): Promise<ManeuverModifiersListing> {
  const params = new URLSearchParams();
  if (skillId) params.set('skillId', skillId);
  if (specialization) params.set('specialization', specialization);
  const query = params.toString();
  const url = `${apiTacticalUrl}/actions/${actionId}/maneuver/modifiers${query ? `?${query}` : ''}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function resolveManeuver(
  actionId: string,
  data: ResolveManeuverDto,
  auth: AuthContextProps
): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/maneuver/resolve`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function prepareAttack(
  actionId: string,
  data: AttackDeclaration,
  auth: AuthContextProps
): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/attack/prepare`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function declareParry(actionId: string, data: ParryDeclaration, auth: AuthContextProps): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/attack/parry`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function updateAttackRoll(
  actionId: string,
  attackName: string,
  roll: number,
  auth: AuthContextProps
): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/attack/roll`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attackName, roll }),
  });
}

/** Critical roll of an attack: every critical of the attack shares it (§9.8), so one call resolves them all. */
export async function updateCriticalRoll(
  actionId: string,
  attackName: string,
  criticalKey: string,
  roll: number,
  auth: AuthContextProps
): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/attack/critical-roll`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attackName, criticalKey, roll }),
  });
}

export async function updateFumbleRoll(
  actionId: string,
  attackName: string,
  roll: number | null,
  auth: AuthContextProps
): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/attack/fumble-roll`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attackName, fumbleRoll: roll }),
  });
}

export async function applyAttack(actionId: string, auth: AuthContextProps): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/attack/apply`;
  return await callApi(auth, url, { method: 'PATCH' });
}
