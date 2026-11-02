import { AuthContextProps } from 'react-oidc-context';
import { apiCoreUrl, apiTacticalUrl, callApi } from '@labcabrera-rmu/rmu-react-shared-lib';
import { FearEffectResult } from './actor-rounds.dto';
import {
  ApplyFearEffectDto,
  FearCheckDto,
  FrightLevels,
  GroupCheckKind,
  GroupCheckResult,
  HealingTables,
  LeaderRollDto,
  MoraleCheckDto,
  ResistanceRollDto,
  ResistanceRollResult,
} from './psychology.dto';

/** Fear RR of an actor (workspace spec 022, decision 8): the API computes it and leaves no effect (see applyFearEffect). */
export async function rollActorResistance(
  actorRoundId: string,
  dto: ResistanceRollDto,
  auth: AuthContextProps
): Promise<ResistanceRollResult> {
  const url = `${apiTacticalUrl}/actor-rounds/${actorRoundId}/resistance-rolls`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

/** Applies the result of an individual fear RR (workspace spec 068): the actor keeps the worst fear state. */
export async function applyFearEffect(
  actorRoundId: string,
  dto: ApplyFearEffectDto,
  auth: AuthContextProps
): Promise<FearEffectResult> {
  const url = `${apiTacticalUrl}/actor-rounds/${actorRoundId}/fear-effects`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

/** Fright levels of Table 14-3a served by tactical to any participant of the game (workspace spec 068, S12 b). */
export async function fetchFrightLevels(gameId: string, auth: AuthContextProps): Promise<FrightLevels> {
  return await callApi(auth, `${apiTacticalUrl}/tactical-games/${gameId}/fright-levels`, { method: 'GET' });
}

/** Fear, morale or rally check of a group (game managers): the API writes the fear effects of the actors. */
export async function groupCheck(
  gameId: string,
  kind: GroupCheckKind,
  dto: FearCheckDto | MoraleCheckDto | LeaderRollDto,
  auth: AuthContextProps
): Promise<GroupCheckResult> {
  const url = `${apiTacticalUrl}/tactical-games/${gameId}/${kind}-checks`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

/** Healing tables of core, for the treatment difficulty preview (the API computes the real one). */
export async function fetchHealingTables(auth: AuthContextProps): Promise<HealingTables> {
  return await callApi(auth, `${apiCoreUrl}/healing-tables`, { method: 'GET' });
}
