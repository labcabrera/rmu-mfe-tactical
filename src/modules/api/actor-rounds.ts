import { AuthContextProps } from 'react-oidc-context';
import { apiTacticalUrl, callApi, Page } from '@labcabrera-rmu/rmu-react-shared-lib';
import {
  ActorRound,
  ActorRoundEffect,
  BreakageCheckDto,
  DefenseLevel,
  MedicalResultDto,
  MedicalRollDto,
  TreatInjuryDto,
  UpdateActorInjuryDto,
} from './actor-rounds.dto';

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
  auth: AuthContextProps,
  strikeReflex?: boolean
): Promise<ActorRound> {
  const url = `${apiTacticalUrl}/actor-rounds/${actorRoundId}/initiative`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(strikeReflex === undefined ? { roll } : { roll, strikeReflex }),
  });
}

/** Declares the passive or partial dodge and block of the round (`full` comes from a dodge action); a missing one is kept. */
export async function declareActorRoundDefenseMode(
  actorRoundId: string,
  mode: { dodge?: DefenseLevel; block?: DefenseLevel },
  auth: AuthContextProps
): Promise<ActorRound> {
  const url = `${apiTacticalUrl}/actor-rounds/${actorRoundId}/defense-mode`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mode),
  });
}

/**
 * Endurance roll of an actor (§5.5): the API adds the modifiers to the roll, reads the endurance table and applies
 * the fatigue and hits of the result. With `alertId`, it also resolves the endurance alert.
 */
export async function resolveEnduranceCheck(
  actorRoundId: string,
  data: { roll: number; alertId?: string; modifiers?: { key: string; value: number }[] },
  auth: AuthContextProps
): Promise<ActorRound> {
  const url = `${apiTacticalUrl}/actor-rounds/${actorRoundId}/endurance-check`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/** Breakage check of an item of the actor (spec 019): the answer carries the result in `lastBreakageCheck`. */
export async function resolveBreakageCheck(
  actorRoundId: string,
  data: BreakageCheckDto,
  auth: AuthContextProps
): Promise<ActorRound> {
  const url = `${apiTacticalUrl}/actor-rounds/${actorRoundId}/breakage-checks`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
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

/** Treats an injury with a Medicine roll of a healer (spec 013, §3). */
export async function treatActorRoundInjury(
  actorRoundId: string,
  injuryId: string,
  dto: TreatInjuryDto,
  auth: AuthContextProps
): Promise<MedicalResultDto> {
  const url = `${apiTacticalUrl}/actor-rounds/${actorRoundId}/injuries/${injuryId}/treatments`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

/** Stabilizes a dying actor: on a success the `dying` effect gains 1 round (2 on an absolute success). */
export async function stabilizeActorRoundEffect(
  actorRoundId: string,
  effectId: string,
  dto: MedicalRollDto,
  auth: AuthContextProps
): Promise<MedicalResultDto> {
  const url = `${apiTacticalUrl}/actor-rounds/${actorRoundId}/effects/${effectId}/stabilize`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function updateActorRoundInjury(
  actorRoundId: string,
  injuryId: string,
  dto: UpdateActorInjuryDto,
  auth: AuthContextProps
): Promise<ActorRound> {
  const url = `${apiTacticalUrl}/actor-rounds/${actorRoundId}/injuries/${injuryId}`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function deleteActorRoundInjury(
  actorRoundId: string,
  injuryId: string,
  auth: AuthContextProps
): Promise<ActorRound> {
  const url = `${apiTacticalUrl}/actor-rounds/${actorRoundId}/injuries/${injuryId}`;
  return await callApi(auth, url, { method: 'DELETE' });
}
