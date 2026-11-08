import { useContext } from 'react';
import type { TFunction } from 'i18next';
import { CombatContext } from '../../CombatContext';
import { Action, ActionApProfile, ActionType, CLOSED_ACTION_STATUSES } from '../api/action.dto';
import { ActorRound, ActorRoundApModifier } from '../api/actor-rounds.dto';
import { actorRoundHasEffect } from './actor-round-service';
import { QUICK_ACTION, QUICKDRAW, SLOW_ON_THE_DRAW, traitTier, traitTierForSkill } from './combat-talents-service';

// Action points of the board (spec 011). The API computes the capacity, the ledger and the readiness of each action;
// these helpers only read them to show them.

const PHASES = 4;

/** Open rounds option of the strategic game (default true): unresolved actions go on in the next round. */
export const useOpenRounds = (): boolean => {
  const context = useContext(CombatContext);
  return context?.strategicGame?.options?.openRounds ?? true;
};

/** AP of each phase (index 0 is phase 1); 1 per phase when the API sends none. */
export const apCapacity = (actorRound: ActorRound): number[] =>
  actorRound.apCapacity && actorRound.apCapacity.length > 0 ? actorRound.apCapacity : new Array(PHASES).fill(1);

/** AP the actor has used in a phase (spent, and instantaneous actions past the first one). */
export const apUsedInPhase = (actorRound: ActorRound, phase: number): number =>
  (actorRound.apLedger ?? [])
    .filter((entry) => entry.phase === phase && entry.kind !== 'lost')
    .reduce((sum, entry) => sum + entry.ap, 0);

/** AP of a phase not used yet. */
export const apFreeInPhase = (actorRound: ActorRound, phase: number): number =>
  Math.max(0, (apCapacity(actorRound)[phase - 1] ?? 0) - apUsedInPhase(actorRound, phase));

/** AP of the round not used yet, from `fromPhase` on. */
export const apRemaining = (actorRound: ActorRound, fromPhase: number): number => {
  let remaining = 0;
  for (let phase = Math.max(1, fromPhase); phase <= PHASES; phase++) remaining += apFreeInPhase(actorRound, phase);
  return remaining;
};

/** AP used in the round and the capacity of the round. */
export const apTotals = (actorRound: ActorRound): { spent: number; capacity: number } => ({
  spent: (actorRound.apLedger ?? []).filter((e) => e.kind !== 'lost').reduce((sum, e) => sum + e.ap, 0),
  capacity: apCapacity(actorRound).reduce((sum, value) => sum + value, 0),
});

/** One line of the AP breakdown of an actor round: "Haste +2", "Staggered −1 (phase 3)", "Cap 2". */
export const apModifierLabel = (modifier: ActorRoundApModifier, t: TFunction): string => {
  const source = t(`ap-source-${modifier.source}`, { defaultValue: t(modifier.source) });
  switch (modifier.kind) {
    case 'bonus':
      return `${source} +${modifier.value}`;
    case 'loss':
      return modifier.phase
        ? `${source} −${modifier.value} (${t('phase-n', { phase: modifier.phase })})`
        : `${source} −${modifier.value}`;
    case 'cap':
      return `${source}: ${t('ap-cap-n', { count: modifier.value })}`;
    default:
      return `${source} ×${modifier.value}`;
  }
};

/** The action is over: it takes no more AP nor resolution steps. */
export const isActionClosed = (action: Action): boolean => CLOSED_ACTION_STATUSES.includes(action.status);

/** The action is still open (not over and not held): it takes 1 AP when the phase changes. */
export const isActionOpen = (action: Action): boolean => !isActionClosed(action) && action.status !== 'held';

/** The action may not fix its result yet: below its minimum AP and not forced (spec 011, §4). */
export const isResolutionBlocked = (action: Action): boolean =>
  (action.readiness === 'blocked' || action.readiness === 'unreachable') && action.resolution?.mode !== 'forced';

/** An action the user can go on with now: resolvable (with or without penalty) or with its resolution under way. */
export const isActionActionable = (action: Action): boolean =>
  action.readiness === undefined || action.readiness === null
    ? !isActionClosed(action) && action.status !== 'parry'
    : (action.readiness === 'ready' || action.readiness === 'optimal' || action.readiness === 'in-resolution') &&
      action.status !== 'parry';

/** Without AP in a phase: a surprised actor loses its first phases (actor rounds without a capacity only say so by the effect). */
export const hasNoCapacityInPhase = (actorRound: ActorRound, phase: number): boolean => {
  if (actorRound.apCapacity) return apCapacity(actorRound)[phase - 1] === 0;
  const surprise = actorRound.effects?.find((effect) => effect.status === 'surprised');
  return !!surprise && phase <= (surprise.value ?? 2);
};

/** The actor cannot act: down, or without capacity in the whole round. Its open actions are interrupted. */
export const actorCannotAct = (actorRound: ActorRound): boolean =>
  actorRoundHasEffect(actorRound, ['dead', 'dying', 'unconscious', 'unconcious']) ||
  apTotals(actorRound).capacity === 0;

/**
 * Actors a free movement can be declared for in a phase: those without any action in it, as the board shows them, that
 * can still act. A free movement takes no AP, so the only limits are the ones of the declaration itself.
 */
export const freeMovementCandidates = (actorRounds: ActorRound[], actions: Action[], phase: number): ActorRound[] =>
  actorRounds.filter(
    (actorRound) =>
      !actorCannotAct(actorRound) &&
      !actorRound.effects?.some((effect) => effect.status === 'flatfooted') &&
      !hasNoCapacityInPhase(actorRound, phase) &&
      !actions.some(
        (action) =>
          action.actorId === actorRound.actorId && action.phaseStart <= phase && (action.phaseEnd ?? phase) >= phase
      )
  );

/**
 * AP range of the action types the palette declares, as rmu-api-tactical sets them (spec 011, §3), shown before the
 * action exists. A maneuver takes its skill's profile: it is only known once declared.
 */
export const DECLARE_AP_PROFILES: Partial<Record<ActionType, ActionApProfile>> = {
  melee_attack: { min: 2, max: 4 },
  ranged_attack: { min: 1, max: 3 },
  movement: { min: 1, max: 1 },
  stand_up: { min: 2, max: 2 },
  dodge: { min: 4, max: 4 },
  cast_spell: { min: 2, max: 4 },
  draw_and_load: { min: 1, max: 1 },
  other: { min: 1, max: 1 },
  // Workspace spec 068: 4 AP in each round a medical action lasts; a healing item takes core's `combatItemAp` (2)
  medical: { min: 4, max: 4 },
  use_item: { min: 2, max: 2 },
  // Workspace spec 076, decision B6: aiming (Sharpshooter) takes the full round
  aim: { min: 4, max: 4 },
};

/**
 * AP of a `draw_and_load` (workspace spec 076, §2.3), as rmu-api-tactical sets them: 0 with Quickdraw for the weapon
 * drawn (it covers drawing and loading, P3), 2 with Slow on the Draw while surprised, 1 otherwise. Without a weapon
 * Quickdraw does not apply.
 */
export const drawAndLoadApProfile = (actorRound: ActorRound, itemId: string | null | undefined): ActionApProfile => {
  const skillId = itemId ? actorRound.attacks.find((attack) => attack.itemId === itemId)?.skillId : undefined;
  if (itemId && traitTierForSkill(actorRound, QUICKDRAW, skillId) > 0) return { min: 0, max: 0 };
  if (traitTier(actorRound, SLOW_ON_THE_DRAW) > 0 && actorRoundHasEffect(actorRound, ['surprised']))
    return { min: 2, max: 2 };
  return { min: 1, max: 1 };
};

/**
 * AP of the maneuver of a combat talent (workspace spec 076, §2.6 and P4): Battle Cry 2, Sense Weakness and Study
 * Offense a full round (4); Precision takes its skill's profile (undefined).
 */
export const COMBAT_TALENT_PURPOSE_AP: Partial<Record<string, ActionApProfile>> = {
  'battle-cry': { min: 2, max: 2 },
  'sense-weakness': { min: 4, max: 4 },
  'study-offense': { min: 4, max: 4 },
};

/**
 * Instantaneous actions of the round that take no AP (spec 011, §2): the first one, or the first two with Quick Action
 * (workspace spec 076, decision B5), which does not count for spells nor dodges.
 */
export const freeInstantsPerRound = (actorRound: ActorRound, actionType?: string): number =>
  traitTier(actorRound, QUICK_ACTION) > 0 && actionType !== 'cast_spell' && actionType !== 'dodge' ? 2 : 1;

/** "2-4 AP" or "1 AP". */
export const apProfileLabel = (profile: ActionApProfile, t: TFunction): string =>
  profile.min === profile.max
    ? t('ap-n', { count: profile.min })
    : t('ap-range', { min: profile.min, max: profile.max });

/** What a phase or round change does to an open action (informative: the API does it on its own). */
export type ActionDestiny = 'continues' | 'no-ap' | 'interrupted' | 'stays' | 'carried' | 'expires' | 'held';

/**
 * Destiny of an open or held action when the game moves on from `phase` (0 = initiative, 1-4, 5 = upkeep), as
 * rmu-api-tactical does it:
 * - to an action phase: a declared action (not free nor forced) takes 1 AP of the new phase (lost without capacity),
 *   or is interrupted when the actor cannot act; one under resolution stays as it is;
 * - to the upkeep: nothing changes;
 * - to the next round: a declared action goes on in the new round with open rounds, else it expires (free actions
 *   always expire); a held action goes on held; one under resolution stays as it is.
 */
export const actionDestiny = (
  action: Action,
  actorRound: ActorRound | undefined,
  phase: number,
  openRounds: boolean
): ActionDestiny => {
  if (action.status === 'held') return 'held';
  if (action.status !== 'declared') return 'stays';
  if (phase >= 5) {
    if (action.freeAction) return 'expires';
    return openRounds ? 'carried' : 'expires';
  }
  if (phase === 4 || action.freeAction || action.resolution?.mode === 'forced') return 'stays';
  if (actorRound && actorCannotAct(actorRound)) return 'interrupted';
  if (actorRound && apFreeInPhase(actorRound, phase + 1) === 0) return 'no-ap';
  return 'continues';
};
