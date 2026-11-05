import { AuthContextProps } from 'react-oidc-context';
import {
  apiTacticalUrl,
  callApi,
  GiveAntidoteDto,
  AlertOutcome,
  Page,
  PoisonData,
  PoisonExposure,
  ResolveAlertDto,
  ResolveCriticalAlertDto,
  ResolveHazardDto,
  ResolvePoisoningDto,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import {
  ActorAntidoteResult,
  ActorRound,
  ActorRoundEffect,
  BreakageCheckDto,
  DefenseLevel,
  MedicalResultDto,
  MedicalRollDto,
  ResolvePoisoningResult,
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

/** Declares the fighting style of the round (spec 032); without a style, the actor fights without one. */
export async function declareActorRoundFightingStyle(
  actorRoundId: string,
  style: { skillId?: string; styleId?: string; options?: string[] },
  auth: AuthContextProps
): Promise<ActorRound> {
  const url = `${apiTacticalUrl}/actor-rounds/${actorRoundId}/fighting-style`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(style),
  });
}

/**
 * Endurance roll of an actor (§5.5): the API adds the modifiers to the roll, reads the endurance table and applies
 * the fatigue and hits of the result. With `alertId`, it also resolves the endurance alert.
 */
/**
 * Marks as resolved an alert handled by hand, such as the critical of a fumble (spec 034). A Mental Focus alert
 * (workspace spec 077) carries the outcome of the maneuver: `failed` breaks every concentration of the actor. A
 * death-threshold alert (workspace spec 079) is `confirmed` (the actor dies) or dismissed without an outcome.
 */
export async function resolveAlert(
  actorRoundId: string,
  alertId: string,
  auth: AuthContextProps,
  outcome?: AlertOutcome
): Promise<ActorRound> {
  const url = `${apiTacticalUrl}/actor-rounds/${actorRoundId}/alerts/${alertId}/resolve`;
  return await callApi(auth, url, {
    method: 'POST',
    ...(outcome
      ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ outcome } as ResolveAlertDto) }
      : {}),
  });
}

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

const jsonPost = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

/** A poison reaches the actor: it waits for its RR (spec 042). */
export async function createActorPoisoning(
  actorRoundId: string,
  poison: PoisonData,
  auth: AuthContextProps
): Promise<{ actorRound: ActorRound; exposure: PoisonExposure }> {
  const url = `${apiTacticalUrl}/actor-rounds/${actorRoundId}/poisonings`;
  return await callApi(auth, url, jsonPost({ poison }));
}

/** The poison RR of an exposure; without a roll the server rolls it (spec 042). */
export async function resolveActorPoisoning(
  actorRoundId: string,
  exposureId: string,
  dto: ResolvePoisoningDto,
  auth: AuthContextProps
): Promise<ResolvePoisoningResult> {
  const url = `${apiTacticalUrl}/actor-rounds/${actorRoundId}/poisonings/${exposureId}/resolve`;
  return await callApi(auth, url, jsonPost(dto));
}

/** Drops an exposure without its RR (spec 042). */
export async function dismissActorPoisoning(
  actorRoundId: string,
  exposureId: string,
  auth: AuthContextProps
): Promise<ActorRound> {
  const url = `${apiTacticalUrl}/actor-rounds/${actorRoundId}/poisonings/${exposureId}`;
  return await callApi(auth, url, { method: 'DELETE' });
}

/** Gives an antidote for a poisoning (spec 042). */
export async function giveActorAntidote(
  actorRoundId: string,
  injuryId: string,
  dto: GiveAntidoteDto,
  auth: AuthContextProps
): Promise<ActorAntidoteResult> {
  const url = `${apiTacticalUrl}/actor-rounds/${actorRoundId}/injuries/${injuryId}/antidote`;
  return await callApi(auth, url, jsonPost(dto));
}

// --- Healing in combat and fear (workspace spec 068) ---

/** Loosens the tourniquet of an injury (0 AP): it bleeds this round and is tight again from the next one. */
export async function loosenActorRoundTourniquet(
  actorRoundId: string,
  injuryId: string,
  auth: AuthContextProps
): Promise<ActorRound> {
  const url = `${apiTacticalUrl}/actor-rounds/${actorRoundId}/injuries/${injuryId}/tourniquet/loosen`;
  return await callApi(auth, url, { method: 'POST' });
}

/** A broken actor drops what it holds in its hands (0 AP): it stays in its inventory (`err-action-fear` otherwise). */
export async function dropActorRoundItems(actorRoundId: string, auth: AuthContextProps): Promise<ActorRound> {
  const url = `${apiTacticalUrl}/actor-rounds/${actorRoundId}/drop-items`;
  return await callApi(auth, url, { method: 'POST' });
}

/** Removes a lasting morale or fear RR modifier of the actor (`err-temporary-modifier-not-found`). */
export async function deleteActorRoundTemporaryModifier(
  actorRoundId: string,
  modifierId: string,
  auth: AuthContextProps
): Promise<ActorRound> {
  const url = `${apiTacticalUrl}/actor-rounds/${actorRoundId}/temporary-modifiers/${modifierId}`;
  return await callApi(auth, url, { method: 'DELETE' });
}

/**
 * A fall or a falling object on the actor (workspace spec 077, decision D2; game master only): an attack on the Crush or
 * Rock table with its damage and criticals. The criticals without a roll stay as `critical` alerts.
 */
export async function resolveHazard(
  actorRoundId: string,
  data: ResolveHazardDto,
  auth: AuthContextProps
): Promise<ActorRound> {
  const url = `${apiTacticalUrl}/actor-rounds/${actorRoundId}/hazards`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/**
 * Rolls the critical of a pending `critical` alert (workspace spec 077, decision D3): a fumble (with its critical type),
 * a movement, a percent maneuver, heat or a hazard. The API applies it and closes the alert; the answer carries
 * `lastCriticalRoll`.
 */
export async function rollCriticalAlert(
  actorRoundId: string,
  alertId: string,
  data: ResolveCriticalAlertDto,
  auth: AuthContextProps
): Promise<ActorRound> {
  const url = `${apiTacticalUrl}/actor-rounds/${actorRoundId}/alerts/${alertId}/critical-roll`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}
