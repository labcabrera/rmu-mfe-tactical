export async function fetchActorRounds(gameId, round) {
  const rsql = `gameId==${gameId};round==${round}`;
  const url = `${process.env.RMU_API_TACTICAL_URL}/actor-rounds?q=${rsql}&page=0&size=100`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status != 200) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  const json = await response.json();
  return json.content;
}
