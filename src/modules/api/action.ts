import { AuthContextProps } from 'react-oidc-context';
import { callApi, Page } from '@labcabrera-rmu/rmu-react-shared-lib';
import { apiTacticalUrl } from '../services/config';
import { Action, AttackDeclaration, ParryDeclaration } from './action.dto';

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

export async function resolveManeuver(actionId: string, data: any, auth: AuthContextProps): Promise<Action> {
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
  locationRoll: number | undefined,
  auth: AuthContextProps
): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/attack/roll`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attackName, roll, locationRoll }),
  });
}

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
