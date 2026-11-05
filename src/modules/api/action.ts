import { AuthContextProps } from 'react-oidc-context';
import { apiTacticalUrl, callApi, Page } from '@labcabrera-rmu/rmu-react-shared-lib';
import {
  Action,
  AttackDeclaration,
  ForceReason,
  FullDefenseType,
  ManeuverModifiersListing,
  ParryDeclaration,
  ResolveManeuverDto,
  ResolveMedicalDto,
  SpellOptions,
  SpellPreview,
  SpellRealm,
  SpellTargetRoll,
} from './action.dto';

export async function fetchAction(actionId: string, auth: AuthContextProps): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchActions(
  rsql: string | undefined,
  page: number,
  size: number,
  auth: AuthContextProps
): Promise<Page<Action>> {
  const url = `${apiTacticalUrl}/actions?q=${rsql || ''}&page=${page}&size=${size}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchActionsByGameAndRound(
  gameId: string,
  round: number,
  auth: AuthContextProps
): Promise<Action[]> {
  const url = `${apiTacticalUrl}/actions?q=gameId==${gameId};round==${round}&size=1000`;
  const res = await callApi(auth, url, { method: 'GET' });
  // The backend may return either an array of actions or a paged response { content: Action[] }
  // Normalize to always return the array of actions.
  if (Array.isArray(res)) return res as Action[];
  if (res && (res as any).content) return (res as any).content as Action[];
  return [];
}

export async function createAction(actionData: any, auth: AuthContextProps): Promise<Action> {
  const url = `${apiTacticalUrl}/actions`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(actionData),
  });
}

export async function deleteAction(actionId: string, auth: AuthContextProps): Promise<boolean> {
  const url = `${apiTacticalUrl}/actions/${actionId}`;
  return await callApi(auth, url, { method: 'DELETE' });
}

/**
 * Resolves a movement. Workspace spec 068: a pace that raises warnings with `requiresConfirm` answers 409
 * `err-action-confirm-required`; send it again with `confirm: true`.
 */
export async function resolveMovement(actionId: string, data: any, auth: AuthContextProps): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/movement/resolve`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/**
 * Completes an action without rolls (stand up, dodge, draw and load, other), with an optional note. A dodge is the
 * 4 AP full defence of the round: `defenseType` says whether it is a full dodge or a full block.
 */
export async function completeAction(
  actionId: string,
  note: string | undefined,
  auth: AuthContextProps,
  defenseType?: FullDefenseType
): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/complete`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note, defenseType }),
  });
}

/** Modifiers a declared maneuver can take, optionally for another skill than the declared one. */
export async function fetchActionManeuverModifiers(
  actionId: string,
  auth: AuthContextProps,
  skillId?: string,
  specialization?: string
): Promise<ManeuverModifiersListing> {
  const params = new URLSearchParams();
  if (skillId) params.set('skillId', skillId);
  if (specialization) params.set('specialization', specialization);
  const query = params.toString();
  const url = `${apiTacticalUrl}/actions/${actionId}/maneuver/modifiers${query ? `?${query}` : ''}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function resolveManeuver(
  actionId: string,
  data: ResolveManeuverDto,
  auth: AuthContextProps
): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/maneuver/resolve`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function prepareAttack(
  actionId: string,
  data: AttackDeclaration,
  auth: AuthContextProps
): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/attack/prepare`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function declareParry(actionId: string, data: ParryDeclaration, auth: AuthContextProps): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/attack/parry`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/**
 * The attack roll: the total of the high open-ended d100, its first die, which decides the fumble, and every die, any of
 * which can call for a breakage check with a 33 or 77 (spec 056). Workspace spec 077: against a target with armor by
 * location and without a called shot, `criticalRoll` (1-100, unmodified) goes with it: its location decides the AT, and
 * the criticals of the attack are rolled with it.
 */
export async function updateAttackRoll(
  actionId: string,
  attackName: string,
  roll: number,
  unmodified: number,
  rolls: number[],
  auth: AuthContextProps,
  criticalRoll?: number
): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/attack/roll`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attackName, roll, unmodified, rolls, ...(criticalRoll ? { criticalRoll } : {}) }),
  });
}

/**
 * Critical roll of an attack: every critical of the attack shares it (§9.8), so one call resolves them all. `reroll`
 * rolls a critical already rolled again with a `critical-reroll` effect (Sense Weakness, Study Offense; workspace spec
 * 076): the new roll counts and the API keeps the first one as `originalRoll`.
 */
export async function updateCriticalRoll(
  actionId: string,
  attackName: string,
  criticalKey: string,
  roll: number,
  auth: AuthContextProps,
  styleOption?: string,
  reroll?: boolean
): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/attack/critical-roll`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attackName, criticalKey, roll, styleOption, ...(reroll ? { reroll: true } : {}) }),
  });
}

export async function updateFumbleRoll(
  actionId: string,
  attackName: string,
  roll: number | null,
  auth: AuthContextProps,
  /** Sum of the dice of the fumble hits (spec 034); the API rolls them when left out. */
  fumbleHits?: number
): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/attack/fumble-roll`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attackName, fumbleRoll: roll, fumbleHits }),
  });
}

export async function applyAttack(actionId: string, auth: AuthContextProps): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/attack/apply`;
  return await callApi(auth, url, { method: 'PATCH' });
}

/** Spends the next free AP of the current phase on a declared action (spec 011, §2). */
export async function spendActionPoint(actionId: string, auth: AuthContextProps): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/spend-ap`;
  return await callApi(auth, url, { method: 'PATCH' });
}

/** Holds a declared action that has its maximum AP, to resolve it later (spec 011, §4). */
export async function holdAction(actionId: string, auth: AuthContextProps): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/hold`;
  return await callApi(auth, url, { method: 'PATCH' });
}

/** Marks an open action to be resolved out of turn, skipping the minimum AP and phase checks (spec 011, §6). */
export async function forceAction(
  actionId: string,
  reason: ForceReason,
  note: string | undefined,
  auth: AuthContextProps
): Promise<Action> {
  const url = `${apiTacticalUrl}/actions/${actionId}/force`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason, note }),
  });
}

// --- Spell casting (spec 030) ---

const patchJson = (auth: AuthContextProps, url: string, body: unknown) =>
  callApi(auth, url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

/** Spellcasting Roll modifiers of some choices (nothing stored). */
export async function previewSpell(
  actionId: string,
  options: SpellOptions,
  auth: AuthContextProps
): Promise<SpellPreview> {
  const url = `${apiTacticalUrl}/actions/${actionId}/spell/preview`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ options }),
  });
}

/**
 * The Spellcasting Roll. Its first die and every die (workspace spec 076) let the API check the chain against the
 * caster's roll profile and apply Terrible Luck and Spasm.
 */
export async function rollSpell(
  actionId: string,
  options: SpellOptions,
  roll: number,
  auth: AuthContextProps,
  dice?: { unmodified: number; rolls: number[] }
): Promise<Action> {
  return await patchJson(auth, `${apiTacticalUrl}/actions/${actionId}/spell/roll`, {
    options,
    roll,
    ...(dice ? { unmodified: dice.unmodified, dice: dice.rolls } : {}),
  });
}

export async function rollSpellFailure(
  actionId: string,
  roll: number,
  realm: SpellRealm | undefined,
  auth: AuthContextProps
): Promise<Action> {
  return await patchJson(auth, `${apiTacticalUrl}/actions/${actionId}/spell/failure-roll`, { roll, realm });
}

export async function resolveSpellResistance(
  actionId: string,
  targets: SpellTargetRoll[],
  auth: AuthContextProps
): Promise<Action> {
  return await patchJson(auth, `${apiTacticalUrl}/actions/${actionId}/spell/resistance-rolls`, { targets });
}

export async function applySpell(
  actionId: string,
  powerPoints: number | undefined,
  auth: AuthContextProps
): Promise<Action> {
  return await patchJson(auth, `${apiTacticalUrl}/actions/${actionId}/spell/apply`, { powerPoints });
}

// --- Healing in combat (workspace spec 068) ---

/**
 * Resolves the next round of 4 AP of a `medical` action: the first one rolls Medicine and starts the treatment, the
 * last one applies it; `stabilize` rolls in every round. Rolls left out are rolled by the API.
 */
export async function resolveMedical(
  actionId: string,
  data: ResolveMedicalDto,
  auth: AuthContextProps
): Promise<Action> {
  return await patchJson(auth, `${apiTacticalUrl}/actions/${actionId}/medical/resolve`, data);
}

/** Resolves a `use_item` action: the healing item heals its target; without a roll the API rolls its range. */
export async function resolveUseItem(actionId: string, roll: number | null, auth: AuthContextProps): Promise<Action> {
  return await patchJson(auth, `${apiTacticalUrl}/actions/${actionId}/use-item/resolve`, roll === null ? {} : { roll });
}
