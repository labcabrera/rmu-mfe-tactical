import { Action } from '../api/action.dto';
import { ActorRound } from '../api/actor-rounds.dto';
import { actorRoundHasEffect, isActorRoundGrappling, isActorRoundProne } from './actor-round-service';

/**
 * Table 5-3 and the check intervals of Table 5-5 (workspace spec 081). `perRound` is BMR per round; `ap` the AP of a
 * normal movement; `penalty` the pace penalty of a free movement, null when a free movement cannot go at that pace;
 * `load` the highest load in %; `check` the i18n key of the interval of the Endurance check.
 */
export const PACES = [
  { id: 'creep', perRound: 0.5, ap: 0, penalty: 0, load: null, check: null },
  { id: 'walk', perRound: 1, ap: 1, penalty: -25, load: 90, check: 'fatigue-check-2-hours' },
  { id: 'jog', perRound: 2, ap: 2, penalty: -50, load: 60, check: 'fatigue-check-5-minutes' },
  { id: 'run', perRound: 3, ap: 3, penalty: -75, load: 45, check: 'fatigue-check-1-minute' },
  { id: 'sprint', perRound: 4, ap: 4, penalty: null, load: 30, check: 'fatigue-check-2-rounds' },
  { id: 'dash', perRound: 5, ap: 4, penalty: null, load: 15, check: 'fatigue-check-1-round' },
] as const;

export const paceIndex = (pace: string | null | undefined): number => PACES.findIndex((row) => row.id === pace);

/** Fastest pace moving backwards or prone (§5.3). */
export const SLOW_MAX_PACE = 'jog';

const HALF_MOVEMENT = 'half_movement';

/** Activity points of a round at each pace: 100 per check of Table 5-5, as the API counts them. */
const ROUND_FATIGUE: Record<string, number> = {
  creep: 0,
  walk: 0,
  jog: 100 / 60,
  run: 100 / 12,
  sprint: 50,
  dash: 100,
};

/** Pace of a round from the AP of normal movement in it (workspace spec 081, decision 5). */
export const paceOfAp = (actionPoints: number): string =>
  PACES[Math.min(Math.max(0, actionPoints), paceIndex('sprint'))].id;

/** Fatigue a normal movement adds over the AP of movement the round already has (decision 6). */
export const normalMovementFatigue = (previousAp: number, actionPoints: number): number =>
  ROUND_FATIGUE[paceOfAp(previousAp + actionPoints)] - ROUND_FATIGUE[paceOfAp(previousAp)];

const isMovement = (action: Action) => action.actionType === 'movement';
const isResolved = (action: Action) => action.status === 'completed';

/** What the movement of an actor comes to in the round, leaving out `except` (the movement being resolved). */
export const roundMovement = (actions: Action[], actorId: string, round: number, except?: string) => {
  const own = actions.filter((a) => a.actorId === actorId && a.round === round && a.id !== except);
  const movements = own.filter(isMovement);
  const normalAp = movements
    .filter((a) => !a.freeAction && isResolved(a))
    .reduce((sum, a) => sum + (a.actionPoints ?? 0), 0);
  const moved = movements.filter(isResolved).reduce((sum, a) => sum + (a.movement?.calculated?.distance ?? 0), 0);
  return { own, movements, freeMovements: movements.filter((a) => a.freeAction), normalAp, moved };
};

/** BMR of the actor with what halves it (the API applies the same), and the keys of what does. */
export const effectiveBmr = (actorRound: ActorRound, backwards = false) => {
  const reasons: string[] = [];
  if (actorRoundHasEffect(actorRound, [HALF_MOVEMENT])) reasons.push('half-movement');
  if ((actorRound.concentration ?? []).length > 0) reasons.push('concentration');
  if (backwards) reasons.push('backwards');
  else if (actorRoundHasEffect(actorRound, ['prone'])) reasons.push('prone');
  return { bmr: actorRound.movement.bmr * 0.5 ** reasons.length, reasons };
};

/** The pace the injuries cap (workspace spec 068): a splinted or cast leg, or a lost one. */
export const injuryPaceLimit = (actorRound: ActorRound): string | undefined =>
  (actorRound.injuries ?? [])
    .filter((injury) => injury.status !== 'healed' && injury.limits?.pace)
    .map((injury) => injury.limits!.pace!)
    .reduce<string | undefined>(
      (slowest, pace) => (slowest === undefined || paceIndex(pace) < paceIndex(slowest) ? pace : slowest),
      undefined
    );

/** The fastest pace of the actor and what caps it below a dash, as i18n keys. */
export const effectiveMaxPace = (actorRound: ActorRound, actorRounds: ActorRound[] | null) => {
  const load = actorRound.movement.maxPace;
  const injury = injuryPaceLimit(actorRound);
  const prone = isActorRoundProne(actorRound);
  const twoFoci = (actorRound.concentration ?? []).length > 1;
  const index = Math.min(
    ...[load, injury, prone ? SLOW_MAX_PACE : undefined, twoFoci ? 'creep' : undefined]
      .map((pace) => paceIndex(pace))
      .filter((each) => each >= 0)
  );
  const reasons: string[] = [];
  if (paceIndex(load) >= 0 && paceIndex(load) < paceIndex('dash')) reasons.push('movement-limit-load');
  if (injury) reasons.push('movement-limit-injury');
  if (prone) reasons.push('movement-limit-prone');
  if (actorRoundHasEffect(actorRound, ['fear-retreat', 'fear-balk'])) reasons.push('movement-limit-fear');
  if (twoFoci) reasons.push('movement-limit-double-concentration');
  if (isActorRoundGrappling(actorRound, actorRounds ?? [])) reasons.push('movement-limit-grapple');
  return { pace: PACES[Number.isFinite(index) ? index : paceIndex('dash')].id as string, reasons };
};

/** Distance a movement covers in an action phase: evenly over the phases it spans. */
const distanceInPhase = (action: Action, phase: number): number => {
  const end = action.phaseEnd ?? action.phaseStart;
  if (!isMovement(action) || !isResolved(action) || phase < action.phaseStart || phase > end) return 0;
  return (action.movement?.calculated?.distance ?? 0) / (end - action.phaseStart + 1);
};

/**
 * Why the actor cannot dash, as far as the board can tell (workspace spec 081, decision 8): the API checks it again, and
 * only it knows the previous round and which actions take the instantaneous action, so neither is said here.
 */
export const dashBlockedReason = (
  actorRound: ActorRound,
  actions: Action[],
  phase: number,
  backwards: boolean
): string | undefined => {
  if (paceIndex(actorRound.movement.maxPace) < paceIndex('dash')) return 'over-max-pace';
  if (backwards || actorRoundHasEffect(actorRound, ['prone'])) return 'movement-slow-max-jog';
  const others = new Set(actions.filter((a) => !isMovement(a)).map((a) => a.id));
  if ((actorRound.apLedger ?? []).some((e) => e.kind !== 'lost' && e.ap > 0 && others.has(e.actionId ?? '')))
    return 'dash-other-actions';
  if (phase > 1) {
    const moved = actions.reduce((sum, a) => sum + distanceInPhase(a, phase - 1), 0);
    if (moved < actorRound.movement.bmr / 2) return 'dash-previous-phase';
  }
  return undefined;
};

/**
 * Workspace spec 081, decision 1: a free movement of the actor that overlaps `action` and is not resolved yet. It does
 * not count for the pace penalty until it is.
 */
export const unresolvedFreeMovement = (actions: Action[], action: Action, currentPhase: number): Action | undefined => {
  const end = Math.max(action.phaseStart, action.phaseEnd ?? currentPhase);
  return actions.find(
    (other) =>
      other.id !== action.id &&
      other.actorId === action.actorId &&
      other.round === action.round &&
      isMovement(other) &&
      other.freeAction &&
      other.status === 'declared' &&
      other.phaseStart <= end
  );
};
