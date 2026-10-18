import { combatActionInfo, type CombatActionState } from '@labcabrera-rmu/rmu-react-shared-lib';
import type { TFunction } from 'i18next';
import type { Action } from '../../api/action.dto';
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

export const actionState = (action: Action): CombatActionState => {
  if (action.status === 'completed') {
    if (hasFumble(action)) return 'failed';
    if (action.maneuver?.result?.result === 'failure') return 'failed';
    return 'resolved';
  }
  // Parry: the attack waits for the defenders.
  if (action.status === 'parry') return 'waiting';
  return 'pending';
};

/** Short label: the type (or maneuver skill), and the targets of an attack. */
export const actionLabel = (action: Action, t: TFunction, actorRounds: ActorRound[] | null): string => {
  let name: string;
  if (action.maneuver) name = t(action.maneuver.modifiers?.skillId || 'maneuver');
  else name = t(combatActionInfo(action.actionType).labelKey);
  const targets = (action.attacks ?? [])
    .map((attack) => actorRounds?.find((ar) => ar.actorId === attack.modifiers?.targetId)?.actorName)
    .filter((targetName): targetName is string => !!targetName);
  const label = targets.length > 0 ? `${name} → ${[...new Set(targets)].join(', ')}` : name;
  return action.freeAction ? `${t('free')} · ${label}` : label;
};

/** One-word result of a completed action (damage, distance, maneuver result), if there is one. */
export const actionResult = (action: Action, t: TFunction): string | undefined => {
  if (action.status !== 'completed') return undefined;
  if (action.attacks?.length) {
    if (hasFumble(action)) return t('fumble');
    const damage = attackDamage(action);
    return damage > 0 ? t('damage-n', { damage }) : t('miss');
  }
  if (action.movement?.calculated?.distanceAdjusted !== undefined) {
    return `${action.movement.calculated.distanceAdjusted}'`;
  }
  if (action.maneuver?.result) return t(action.maneuver.result.result);
  return undefined;
};
