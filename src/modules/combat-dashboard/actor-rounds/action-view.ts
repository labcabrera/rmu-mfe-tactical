import { combatActionInfo, type CombatActionState } from '@labcabrera-rmu/rmu-react-shared-lib';
import type { TFunction } from 'i18next';
import { CLOSED_ACTION_STATUSES as CLOSED_STATUSES, type Action } from '../../api/action.dto';
import type { ActorRound } from '../../api/actor-rounds.dto';

// How the board shows an action: its state (needs input, waiting, resolved, failed), a short label and a
// one-word result, derived from what the tactical API returns.

const hasFumble = (action: Action) => !!action.attacks?.some((attack) => attack.results?.fumble);

/** Damage of an attack action: attack table damage plus critical damage, over all its attacks. */
export const attackDamage = (action: Action): number =>
  (action.attacks ?? []).reduce((total, attack) => {
    const table = attack.results?.attackTableEntry?.damage ?? 0;
    const criticals = (attack.results?.criticals ?? []).reduce((sum, c) => sum + (c.result?.damage ?? 0), 0);
    return total + table + criticals;
  }, 0);

/**
 * State of the marker of an action, from its readiness (spec 011, §4): below its minimum AP (`blocked`), unable to
 * reach it this round (`unreachable`), resolvable with a penalty or under way (`pending`), with its maximum AP
 * (`optimal`), held, or over. An action interrupted or expired shows as failed; one carried to the next round, as
 * waiting.
 */
export const actionState = (action: Action): CombatActionState => {
  if (action.status === 'completed') {
    if (hasFumble(action)) return 'failed';
    const result = action.maneuver?.result?.result;
    if (result === 'failure' || result === 'absolute-failure') return 'failed';
    if (action.spell?.result && action.spell.result !== 'success') return 'failed';
    return 'resolved';
  }
  if (action.status === 'interrupted' || action.status === 'expired') return 'failed';
  if (action.status === 'carried') return 'waiting';
  if (action.status === 'held') return 'held';
  // Parry: the attack waits for the defenders.
  if (action.status === 'parry') return 'waiting';
  // A forced action resolves out of turn, whatever its AP.
  if (action.resolution?.mode === 'forced') return 'pending';
  switch (action.readiness) {
    case 'blocked':
      return 'blocked';
    case 'unreachable':
      return 'unreachable';
    case 'optimal':
      return 'optimal';
    case 'held':
      return 'held';
    default:
      return 'pending';
  }
};

/** "2/4 AP": AP spent on the action over its maximum; the spent ones alone without a profile. */
export const actionApText = (action: Action, t: TFunction): string | undefined => {
  if (action.actionPoints === null || action.actionPoints === undefined) return undefined;
  return action.apProfile
    ? t('ap-of-max', { ap: action.actionPoints, max: action.apProfile.max })
    : t('ap-n', { count: action.actionPoints });
};

/**
 * Tooltip of the marker of an action: its readiness with its AP ("Blocked · 1/2 AP, minimum 2"), the penalty if it
 * were resolved now, and whether it goes on in the next round.
 */
export const actionStateTooltip = (action: Action, t: TFunction, openRounds: boolean): string => {
  const state = actionState(action);
  const parts: string[] = [];
  if (CLOSED_STATUSES.includes(action.status) || action.status === 'held') {
    parts.push(t(`action-status-${action.status}`));
  } else if (action.resolution?.mode === 'forced') {
    parts.push(t('action-forced-reason', { reason: t(`force-reason-${action.resolution.reason ?? 'gm'}`) }));
  } else if (action.readiness) {
    parts.push(t(`action-readiness-${action.readiness}`));
  } else {
    parts.push(t(`action-state-${state}`));
  }
  const ap = actionApText(action, t);
  if (ap && action.status !== 'completed') parts.push(ap);
  if (action.apProfile && (action.readiness === 'blocked' || action.readiness === 'unreachable'))
    parts.push(t('ap-minimum-n', { count: action.apProfile.min }));
  if (action.readiness === 'ready' && action.readinessPenalty)
    parts.push(t('resolves-at-penalty', { penalty: action.readinessPenalty }));
  if (action.readiness === 'unreachable') parts.push(t(openRounds ? 'continues-next-round' : 'expires-at-round-end'));
  if (action.continuesActionId) parts.push(t('continues-previous-round', { count: action.carriedAp ?? 0 }));
  return parts.join(' · ');
};

/** Short label: the type (or maneuver skill, or spell), and the targets of an attack or a spell. */
export const actionLabel = (action: Action, t: TFunction, actorRounds: ActorRound[] | null): string => {
  let name: string;
  if (action.maneuver) name = t(action.maneuver.modifiers?.skillId || 'maneuver');
  else if (action.spell) name = action.spell.spell.name;
  else name = t(combatActionInfo(action.actionType).labelKey);
  const targets = (action.attacks ?? [])
    .map((attack) => actorRounds?.find((ar) => ar.actorId === attack.modifiers?.targetId)?.actorName)
    .concat((action.spell?.targets ?? []).map((target) => target.actorName ?? undefined))
    .filter((targetName): targetName is string => !!targetName);
  const label = targets.length > 0 ? `${name} → ${[...new Set(targets)].join(', ')}` : name;
  if (action.resolution?.mode === 'forced' && !action.freeAction) return `${t('forced')} · ${label}`;
  return action.freeAction ? `${t('free')} · ${label}` : label;
};

/** One-word result of a completed action (damage, distance, maneuver or spell result), if there is one. */
export const actionResult = (action: Action, t: TFunction): string | undefined => {
  // Interrupted, expired, carried or held: the status says it.
  if (action.status !== 'completed' && (CLOSED_STATUSES.includes(action.status) || action.status === 'held'))
    return t(`action-status-${action.status}`);
  if (action.status !== 'completed') return undefined;
  if (action.attacks?.length) {
    if (hasFumble(action)) return t('fumble');
    const damage = attackDamage(action);
    return damage > 0 ? t('damage-n', { damage }) : t('miss');
  }
  if (action.movement?.calculated?.distanceAdjusted !== undefined) {
    return `${action.movement.calculated.distanceAdjusted}'`;
  }
  if (action.spell?.result) return t(`spell-result-${action.spell.result}`);
  const maneuverResult = action.maneuver?.result;
  if (maneuverResult?.result) return t(maneuverResult.result);
  if (maneuverResult?.percent !== undefined && maneuverResult.percent !== null) {
    return `${action.maneuver?.progress ?? maneuverResult.percent}%`;
  }
  return undefined;
};
