import { Action, AttackDeclarationDto, DeclareParryItemDto } from './action.dto';
import { buildErrorFromResponse } from './api-errors';

export async function fetchAction(actionId: string): Promise<Action> {
  const url = `${process.env.RMU_API_TACTICAL_URL}/actions/${actionId}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const json = await response.json();
  return json.content;
}

export async function fetchActionsByGameAndRound(gameId: string, round: number): Promise<Action[]> {
  const url = `${process.env.RMU_API_TACTICAL_URL}/actions?q=gameId==${gameId};round==${round}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const json = await response.json();
  return json.content;
}

export async function createAction(actionData: any): Promise<Action> {
  const url = `${process.env.RMU_API_TACTICAL_URL}/actions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(actionData),
  });
  if (response.status !== 201) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function deleteAction(actionId: string): Promise<boolean> {
  const url = `${process.env.RMU_API_TACTICAL_URL}/actions/${actionId}`;
  const response = await fetch(url, { method: 'DELETE' });
  if (response.status !== 204) {
    throw await buildErrorFromResponse(response, url);
  }
  return true;
}

export async function resolveMovement(actionId: string, data: any): Promise<any> {
  const url = `${process.env.RMU_API_TACTICAL_URL}/actions/${actionId}/movement/resolve`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function prepareAttack(actionId: string, data: AttackDeclarationDto): Promise<Action> {
  const url = `${process.env.RMU_API_TACTICAL_URL}/actions/${actionId}/attack/prepare`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function declareParry(actionId: string, data: DeclareParryItemDto): Promise<Action> {
  const url = `${process.env.RMU_API_TACTICAL_URL}/actions/${actionId}/attack/parry`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function updateAttackRoll(actionId: string, attackName: string, roll: number, location: string | undefined): Promise<Action> {
  const url = `${process.env.RMU_API_TACTICAL_URL}/actions/${actionId}/attack/roll`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ attackName, roll, location }),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function updateCriticalRoll(actionId: string, attackName: string, criticalKey: string, roll: number): Promise<Action> {
  const url = `${process.env.RMU_API_TACTICAL_URL}/actions/${actionId}/attack/critical-roll`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ attackName, criticalKey, roll }),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function applyAttack(actionId: string): Promise<Action> {
  const url = `${process.env.RMU_API_TACTICAL_URL}/actions/${actionId}/attack/apply`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}
