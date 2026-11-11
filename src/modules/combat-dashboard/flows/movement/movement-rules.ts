import { Action, ActionMovement, MOVEMENT_TABLE } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import { actorRoundHasEffect, isActorRoundGrappling, isActorRoundProne } from '../../../services/actor-round-service';
import {
  dashBlockedReason,
  effectiveBmr,
  effectiveMaxPace,
  injuryPaceLimit,
  NORMAL_PACES,
  paceFatigue,
  paceIndex,
  paceOfAp,
  PACES,
  roundMovement,
  SLOW_MAX_PACE,
} from '../../../services/movement-service';

type MovementModifiers = ActionMovement['modifiers'];

/** Distances below this are rounding errors of the halved BMR: nothing is left to move. */
const NOTHING_LEFT = 0.001;

/** Distances and fatigue are shown with one decimal at most. */
export const oneDecimal = (value: number): number => Number(value.toFixed(1));

/** The stored choices of the action, or the defaults of a new movement. */
export const initialMovementForm = (action: Action, actorRound: ActorRound, light: string | null): ActionMovement =>
  action.movement
    ? { modifiers: action.movement.modifiers, roll: action.movement.roll ?? { roll: null } }
    : {
        modifiers: {
          pace: '',
          requiredManeuver: false,
          skillId: 'running',
          difficulty: actorRound.movement?.baseDifficulty || null,
          customBonus: null,
          light,
        },
        roll: { roll: null },
      };

/** Going backwards forgets a chosen pace the slow limit no longer allows. */
export const backwardsChange = (pace: MovementModifiers['pace'], backwards: boolean): Partial<MovementModifiers> => {
  const tooFast = backwards && paceIndex(pace) > paceIndex(SLOW_MAX_PACE);
  return { backwards, pace: tooFast ? '' : pace };
};

export type MovementPlanInput = {
  action: Action;
  actorRound: ActorRound;
  actorRounds: ActorRound[] | null | undefined;
  roundActions: Action[] | null | undefined;
  currentPhase: number;
  modifiers: MovementModifiers;
  fatigueMultiplier?: number;
};

/** What the choices of a movement come to: limits of the paces, distances and fatigue, as the API will count them. */
export const movementPlan = ({
  action,
  actorRound,
  actorRounds,
  roundActions,
  currentPhase,
  modifiers,
  fatigueMultiplier,
}: MovementPlanInput) => {
  const freeMovement = !!action.freeAction;
  // A free movement covers its pace per phase spanned; a normal one 1 BMR per AP (the API counts them in its ledger).
  const actionPoints = freeMovement
    ? Math.max(1, (currentPhase || action.phaseStart) - action.phaseStart + 1)
    : Math.max(1, action.actionPoints ?? 1);
  const freeMaxIndex = freeMovement ? paceIndex('run') : MOVEMENT_TABLE.length;
  const injuryLimit = injuryPaceLimit(actorRound);
  const twoFoci = (actorRound.concentration ?? []).length > 1;
  const maxPaceIndex = Math.min(
    MOVEMENT_TABLE.findIndex((p) => p.id === actorRound.movement.maxPace),
    injuryLimit ? paceIndex(injuryLimit) : MOVEMENT_TABLE.length,
    twoFoci ? paceIndex('creep') : MOVEMENT_TABLE.length
  );
  const fleeing = actorRoundHasEffect(actorRound, ['fear-routed', 'fear-broken']);
  const fearCap = actorRoundHasEffect(actorRound, ['fear-retreat'])
    ? { state: 'fear-retreat', index: paceIndex('jog') }
    : actorRoundHasEffect(actorRound, ['fear-balk'])
      ? { state: 'fear-balk', index: paceIndex('walk') }
      : undefined;
  const backwards = !!modifiers.backwards;
  const prone = isActorRoundProne(actorRound);
  const slow = backwards || prone;
  const { bmr, reasons: bmrReasons } = effectiveBmr(actorRound, backwards);
  const distance = (multiplier: number) => bmr * multiplier * actionPoints;
  // What the movement of the round has left, as the API cuts it.
  const round = roundMovement(roundActions ?? [], action.actorId, action.round, action.id);
  const limitIndex = Math.min(
    paceIndex(effectiveMaxPace(actorRound, actorRounds ?? null).pace),
    slow ? paceIndex(SLOW_MAX_PACE) : PACES.length - 1
  );
  const left = Math.max(0, bmr * PACES[limitIndex].perRound - round.moved);
  const nothingLeft = bmr > 0 && left <= NOTHING_LEFT;
  const dashing = !freeMovement && modifiers.pace === 'dash';
  const dashBlocked = freeMovement ? undefined : dashBlockedReason(actorRound, round.own, currentPhase, backwards);
  // A normal movement may choose a pace slower than its AP, which caps what the round covers, or a faster one, which
  // only adds fatigue; by default it takes the pace of the AP of the round.
  const apPace = paceOfAp(round.normalAp + actionPoints);
  const normalMaxIndex = Math.min(maxPaceIndex, slow ? paceIndex(SLOW_MAX_PACE) : paceIndex('sprint'));
  const paceCap = (pace: string) => Math.max(0, bmr * PACES[paceIndex(pace)].perRound - round.moved);
  const paceReached = (pace: string) => bmr > 0 && paceCap(pace) <= NOTHING_LEFT;
  const normalPaceDisabled = (pace: string) =>
    paceIndex(pace) > normalMaxIndex || (fleeing && paceIndex(pace) < paceIndex('run')) || paceReached(pace);
  const enabledPaces = NORMAL_PACES.map((row) => row.id as string).filter((pace) => !normalPaceDisabled(pace));
  const defaultPace = normalPaceDisabled(apPace)
    ? (enabledPaces.find((pace) => paceIndex(pace) > paceIndex(apPace)) ?? enabledPaces[enabledPaces.length - 1])
    : apPace;
  const chosenPace: string | undefined = dashing ? 'dash' : modifiers.pace || defaultPace;
  const normalPaceDistance = (pace: string) => Math.min(left, distance(1), paceCap(pace));
  const normalDistance = dashing ? Math.min(left, distance(1.25)) : chosenPace ? normalPaceDistance(chosenPace) : 0;
  const talliedFatigue = !dashing && !['climbing', 'swimming'].includes(modifiers.skillId);
  const addedFatigue = (chosenPace ? paceFatigue(round.normalPace, chosenPace) : 0) * (fatigueMultiplier || 1);
  return {
    freeMovement,
    actionPoints,
    freeMaxIndex,
    injuryLimit,
    twoFoci,
    maxPaceIndex,
    fleeing,
    fearCap,
    backwards,
    prone,
    slow,
    bmrReasons,
    distance,
    left,
    nothingLeft,
    dashing,
    dashBlocked,
    apPace,
    paceReached,
    normalPaceDisabled,
    chosenPace,
    normalPaceDistance,
    normalDistance,
    talliedFatigue,
    addedFatigue,
    blocked: nothingLeft || (!freeMovement && twoFoci),
    grappleFeatNeeded: isActorRoundGrappling(actorRound, actorRounds ?? []),
    /** The pace the movement goes at: the one chosen, and in a normal movement the one of its AP unless another was. */
    pace: freeMovement ? modifiers.pace || undefined : chosenPace,
  };
};

export type MovementPlan = ReturnType<typeof movementPlan>;

/** The first step is complete: the maneuver and the grapple are settled and a pace the actor can take is chosen. */
export const movementSetupReady = (plan: MovementPlan, modifiers: MovementModifiers): boolean =>
  (!modifiers.requiredManeuver || !!modifiers.difficulty) &&
  (!plan.grappleFeatNeeded || !!modifiers.grappleFeat) &&
  !plan.blocked &&
  (plan.freeMovement
    ? !!modifiers.pace
    : plan.dashing || (!!plan.chosenPace && !plan.normalPaceDisabled(plan.chosenPace)));

/** Caption of a pace: a translation key (the pace, translated, as its parameter), a literal text, or none. */
export type PaceCaption = { key: string; pace?: string } | { text: string } | null;

const injuryCaption = (limit: string): PaceCaption => ({ key: 'injury-pace-limit', pace: limit });

/** The caption of a pace of a normal movement: why it cannot be taken, or how it compares with the AP spent. */
export const normalPaceCaption = (plan: MovementPlan, pace: string): PaceCaption => {
  const index = paceIndex(pace);
  const { maxPaceIndex, injuryLimit, fearCap } = plan;
  if (plan.paceReached(pace)) return { key: 'movement-pace-reached' };
  if (plan.slow && index > paceIndex(SLOW_MAX_PACE) && index <= maxPaceIndex) return { key: 'movement-slow-max-jog' };
  if (index > maxPaceIndex && injuryLimit && index > paceIndex(injuryLimit)) return injuryCaption(injuryLimit);
  if (index > maxPaceIndex) return { key: 'over-max-pace' };
  if (plan.fleeing && index < paceIndex('run')) return { key: 'fear-flees-at-run' };
  if (fearCap && index > fearCap.index) return { key: `fear-pace-warning-${fearCap.state}` };
  if (index > paceIndex(plan.apPace)) return { key: 'movement-pace-over-ap' };
  return pace === plan.apPace ? { key: 'movement-pace-of-ap' } : null;
};

/** Whether a free movement can go at the pace of a row of the table, and the caption of that row. */
export const freePaceOption = (
  plan: MovementPlan,
  row: (typeof MOVEMENT_TABLE)[number],
  index: number
): { disabled: boolean; caption: PaceCaption } => {
  const overMax = index > plan.maxPaceIndex;
  const overFree = index > plan.freeMaxIndex;
  const tooSlow = plan.fleeing && index < paceIndex('run');
  const overSlow = plan.slow && index > paceIndex(SLOW_MAX_PACE);
  const { injuryLimit, fearCap } = plan;
  let caption: PaceCaption = null;
  if (overFree && !overMax) caption = { key: 'free-movement-max-run' };
  else if (overSlow && !overMax) caption = { key: 'movement-slow-max-jog' };
  else if (overMax && injuryLimit && index > paceIndex(injuryLimit)) caption = injuryCaption(injuryLimit);
  else if (overMax) caption = { key: 'over-max-pace' };
  else if (tooSlow) caption = { key: 'fear-flees-at-run' };
  else if (fearCap && index > fearCap.index) caption = { key: `fear-pace-warning-${fearCap.state}` };
  else if (row.penalty !== '-') caption = { text: row.penalty.split(' | ')[0] };
  return { disabled: overMax || overFree || tooSlow || overSlow, caption };
};
