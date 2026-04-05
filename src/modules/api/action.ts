import { getAuthHeaders, mergeJsonHeaders } from '../services/auth-token-service';
import { apiTacticalUrl } from '../services/config';
import { Action, AttackDeclaration, ParryDeclaration } from './action.dto';
import { buildErrorFromResponse } from './api-errors';

export async function fetchAction(actionId: string): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const json = await response.json();
  return json.content;
}

export async function fetchActions(rsql: string | undefined, page: number, size: number): Promise<Action[]> {
  const url = `${apiTacticalUrl}/actions?q=${rsql || ''}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const json = await response.json();
  return json.content;
}

export async function fetchActionsByGameAndRound(gameId: string, round: number): Promise<Action[]> {
  const url = `${apiTacticalUrl}/actions?q=gameId==${gameId};round==${round}&size=1000`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const json = await response.json();
  return json.content;
}

export async function createAction(actionData: any): Promise<Action> {
  const url = `${apiTacticalUrl}/actions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: mergeJsonHeaders(),
    body: JSON.stringify(actionData),
  });
  if (response.status !== 201) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function deleteAction(actionId: string): Promise<boolean> {
  const url = `${apiTacticalUrl}/actions/${actionId}`;
  const response = await fetch(url, { method: 'DELETE', headers: getAuthHeaders() });
  if (response.status !== 204) {
    throw await buildErrorFromResponse(response, url);
  }
  return true;
}

export async function resolveMovement(actionId: string, data: any): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/movement/resolve`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: mergeJsonHeaders(),
    body: JSON.stringify(data),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function resolveManeuver(actionId: string, data: any): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/maneuver/resolve`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: mergeJsonHeaders(),
    body: JSON.stringify(data),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function prepareAttack(actionId: string, data: AttackDeclaration): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/attack/prepare`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: mergeJsonHeaders(),
    body: JSON.stringify(data),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function declareParry(actionId: string, data: ParryDeclaration): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/attack/parry`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: mergeJsonHeaders(),
    body: JSON.stringify(data),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function updateAttackRoll(
  actionId: string,
  attackName: string,
  roll: number,
  locationRoll: number | undefined
): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/attack/roll`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: mergeJsonHeaders(),
    body: JSON.stringify({ attackName, roll, locationRoll }),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function updateCriticalRoll(
  actionId: string,
  attackName: string,
  criticalKey: string,
  roll: number
): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/attack/critical-roll`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: mergeJsonHeaders(),
    body: JSON.stringify({ attackName, criticalKey, roll }),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function updateFumbleRoll(actionId: string, attackName: string, roll: number | null): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/attack/fumble-roll`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: mergeJsonHeaders(),
    body: JSON.stringify({ attackName, fumbleRoll: roll }),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function applyAttack(actionId: string): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/attack/apply`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: mergeJsonHeaders(),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}
