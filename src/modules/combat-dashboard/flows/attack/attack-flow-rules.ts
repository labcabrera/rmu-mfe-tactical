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

/** Statuses of a prepared attack not applied yet: preparing it again starts it over (workspace spec 101). */
const MODIFIABLE_STATUSES = ['prepared', 'parry', 'pending_roll', 'pending_apply'];

/**
 * Workspace spec 101: an attack can go back to its targets and modifiers until it is applied. The API prepares it again,
 * which drops its parries and rolls. The attack of a spell, only while the cast is not applied.
 */
export const canModifyAttack = (action: Action): boolean =>
  MODIFIABLE_STATUSES.includes(action.status) &&
  (action.attacks ?? []).length > 0 &&
  (action.actionType !== 'cast_spell' ||
    action.spell?.powerPointsSpent === null ||
    action.spell?.powerPointsSpent === undefined);

export type ModifyLoss = {
  /** Parries declared by the defenders, with the OB they gave. */
  parries: { actorId: string; actorName: string; parry: number }[];
  /** Shield maneuvers already resolved. */
  shieldManeuvers: number;
  /** Rolls already sent, by attack. */
  rolls: { attackName: string; kinds: ('attack' | 'critical' | 'fumble')[] }[];
};

const hasValue = (value: number | null | undefined) => value !== null && value !== undefined;

/** What preparing the attack again drops (workspace spec 101): asked for before going back, when there is anything. */
export const lostOnModify = (action: Action, actorRounds: ActorRound[] | null | undefined): ModifyLoss => {
  const nameOf = (actorId: string) => actorRounds?.find((each) => each.actorId === actorId)?.actorName ?? actorId;
  const parries = (action.parries ?? [])
    .filter((parry) => !parry.carriedOver && (parry.parry ?? 0) > 0)
    .map((parry) => ({ actorId: parry.actorId, actorName: nameOf(parry.actorId), parry: parry.parry }));
  const attacks = action.attacks ?? [];
  const shieldManeuvers = attacks.filter((attack) => {
    const passed = attack.shieldManeuver?.passed;
    return !!attack.shieldManeuver?.required && passed !== null && passed !== undefined;
  }).length;
  const rolls = attacks
    .map((attack) => {
      const kinds: ('attack' | 'critical' | 'fumble')[] = [];
      if (hasValue(attack.roll?.roll)) kinds.push('attack');
      if (Object.values(attack.roll?.criticalRolls ?? {}).some(hasValue)) kinds.push('critical');
      if (hasValue(attack.roll?.fumbleRoll)) kinds.push('fumble');
      return { attackName: attack.attackName, kinds };
    })
    .filter((each) => each.kinds.length > 0);
  return { parries, shieldManeuvers, rolls };
};

export const isModifyLossEmpty = (loss: ModifyLoss): boolean =>
  loss.parries.length === 0 && loss.shieldManeuvers === 0 && loss.rolls.length === 0;

/**
 * The OB an attack keeps when it goes back (workspace spec 101): what it had while the action holds its OB reserved
 * (preparing again gives it back), or else what the actor has left, as a parry may have lowered it (spec 082).
 */
export const obOnModify = (action: Action, actorRound: ActorRound, attackName: string, bo: number): number => {
  const reserved = (actorRound.boReservations ?? []).some(
    (reservation) => reservation.actionId === action.id && reservation.kind === 'attack'
  );
  const left = actorRound.attacks.find((each) => each.attackName === attackName)?.currentBo ?? bo;
  return reserved ? bo : Math.min(bo, Math.max(0, left));
};
