import { AuthContextProps } from 'react-oidc-context';
import { callApi, Page } from '@labcabrera-rmu/rmu-react-shared-lib';
import { apiTacticalUrl } from '../services/config';
import { ActorRound, ActorRoundEffect } from './actor-rounds.dto';

export async function fetchActorRound(actorRoundId: string, auth: AuthContextProps): Promise<ActorRound> {
  const url = `${apiTacticalUrl}/actor-rounds/${actorRoundId}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchActorRounds(
  gameId: string,
  round: number,
  auth: AuthContextProps
): Promise<Page<ActorRound>> {
  const rsql = `gameId==${gameId};round==${round}`;
  const url = `${apiTacticalUrl}/actor-rounds?q=${rsql}&page=0&size=100`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function declareActorRoundInitiative(
  actorRoundId: string,
  roll: number,
  auth: AuthContextProps
): Promise<ActorRound> {
  const url = `${apiTacticalUrl}/actor-rounds/${actorRoundId}/initiative`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roll }),
  });
}

export async function addActorRoundHp(actorRoundId: string, hp: number, auth: AuthContextProps): Promise<ActorRound> {
  const url = `${apiTacticalUrl}/actor-rounds/${actorRoundId}/hp`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dmg: hp }),
  });
}

export async function addActorRoundEffect(
  actorRoundId: string,
  effect: ActorRoundEffect,
  auth: AuthContextProps
): Promise<ActorRound> {
  const url = `${apiTacticalUrl}/actor-rounds/${actorRoundId}/effects`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(effect),
  });
}

export async function addActorRoundFatigueAccumulator(
  actorRoundId: string,
  value: number,
  auth: AuthContextProps
): Promise<ActorRound> {
  const url = `${apiTacticalUrl}/actor-rounds/${actorRoundId}/fatigue-accumulator`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  });
}

export async function deleteActorRoundEffect(
  actorRoundId: string,
  effectId: string,
  auth: AuthContextProps
): Promise<ActorRound> {
  const url = `${apiTacticalUrl}/actor-rounds/${actorRoundId}/effects/${effectId}`;
  return await callApi(auth, url, { method: 'DELETE' });
}
