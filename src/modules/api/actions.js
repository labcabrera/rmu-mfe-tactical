export async function fetchAction(actionId) {
  const url = `${process.env.RMU_API_TACTICAL_URL}/actions/${actionId}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status != 200) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  const json = await response.json();
  return json.content;
}

export async function fetchActionsByGameAndRound(gameId, round) {
  const url = `${process.env.RMU_API_TACTICAL_URL}/actions?q=gameId==${gameId};round==${round}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status != 200) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  const json = await response.json();
  return json.content;
}

export async function createAction(actionData) {
  const url = `${process.env.RMU_API_TACTICAL_URL}/actions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(actionData),
  });
  if (response.status != 201) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  const json = await response.json();
  return json.content;
}
