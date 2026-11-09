import type { Action } from '../../../api/action.dto';
import type { ActorRound } from '../../../api/actor-rounds.dto';

/**
 * Step of the flow for an action status: before prepare the step is local (targets or modifiers). A spell cast has
 * its own statuses: its attack is local until the attacks are prepared.
 */
export const stepOf = (action: Action, parry: boolean, localStep: number) => {
  if (action.actionType === 'cast_spell' && !action.attacks?.length) return localStep;
  switch (action.status) {
    case 'declared':
    case 'held':
      return localStep;
    case 'parry':
      return 2;
    case 'completed':
      return parry ? 4 : 3;
    default:
      return parry ? 3 : 2;
  }
};

/**
 * Workspace spec 082, decision 8: the API does not say which attacks a parry lowered. One not rolled yet, at the OB the
 * actor has left after parrying, may be one of them, so it can go back to its targets.
 */
export const attackChangeable = (action: Action, actorRound: ActorRound, spendsRoundOb: boolean): boolean =>
  spendsRoundOb &&
  ['prepared', 'parry', 'pending_roll'].includes(action.status) &&
  ((actorRound.parries ?? []).length > 0 || (actorRound.boReservations ?? []).length > 0) &&
  (action.attacks ?? []).some(
    (attack) =>
      !attack.roll?.roll &&
      (attack.modifiers.bo ?? 0) >=
        (actorRound.attacks.find((each) => each.attackName === attack.attackName)?.currentBo ?? 0)
  );
