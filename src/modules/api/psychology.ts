import { AuthContextProps } from 'react-oidc-context';
import { apiCoreUrl, apiTacticalUrl, callApi } from '@labcabrera-rmu/rmu-react-shared-lib';
import {
  FearCheckDto,
  GroupCheckKind,
  GroupCheckResult,
  HealingTables,
  LeaderRollDto,
  MoraleCheckDto,
  PsychologyTables,
  ResistanceRollDto,
  ResistanceRollResult,
} from './psychology.dto';

/** Fear RR of an actor (workspace spec 022, decision 8): the API computes it and leaves no effect. */
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

/** Psychology tables of core (rmu-core-law role; 404 until they are imported). */
export async function fetchPsychologyTables(auth: AuthContextProps): Promise<PsychologyTables> {
  return await callApi(auth, `${apiCoreUrl}/psychology-tables`, { method: 'GET' });
}

/** Healing tables of core, for the treatment difficulty preview (the API computes the real one). */
export async function fetchHealingTables(auth: AuthContextProps): Promise<HealingTables> {
  return await callApi(auth, `${apiCoreUrl}/healing-tables`, { method: 'GET' });
}
