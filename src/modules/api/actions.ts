import { buildErrorFromResponse } from './api-errors';

export type Action = {
  id: number;
  [key: string]: any;
};

export async function fetchAction(actionId: number): Promise<Action> {
  const url = `${process.env.RMU_API_TACTICAL_URL}/actions/${actionId}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const json = await response.json();
  return json.content;
}

export async function fetchActionsByGameAndRound(gameId: number, round: number): Promise<Action[]> {
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

export async function deleteAction(actionId: number): Promise<boolean> {
  const url = `${process.env.RMU_API_TACTICAL_URL}/actions/${actionId}`;
  const response = await fetch(url, { method: 'DELETE' });
  if (response.status !== 204) {
    throw await buildErrorFromResponse(response, url);
  }
  return true;
}

export async function resolveMovement(actionId: number, data: any): Promise<any> {
  const url = `${process.env.RMU_API_TACTICAL_URL}/actions/${actionId}/resolve/movement`;
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

export async function prepareAttack(actionId: number, actionData: any): Promise<Action> {
  const url = `${process.env.RMU_API_TACTICAL_URL}/actions/${actionId}/prepare`;
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
  const json = await response.json();
  return json.content;
}
