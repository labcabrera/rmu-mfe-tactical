import { Action } from '../api/action.dto';
import { ActorRound } from '../api/actor-rounds.dto';

const PACE_ORDER = ['creep', 'walk', 'jog', 'run', 'sprint', 'dash'];

export function isActorRoundDead(actorRound: ActorRound): boolean {
  return actorRoundHasEffect(actorRound, ['dead', 'unconscious']);
}

export function actorRoundHasEffect(actorRound: ActorRound, statuses: string[]): boolean {
  return actorRound.effects?.some((se) => statuses.includes(se.status)) || false;
}

export function isActorRoundDisabled(actorRound: ActorRound): boolean {
  return actorRoundHasEffect(actorRound, ['stunned', 'unconscious', 'dead']);
}

export function isActorRoundProne(actorRound: ActorRound): boolean {
  return actorRoundHasEffect(actorRound, ['prone', 'unconscious', 'dead']);
}

export function isActorRoundStunned(actorRound: ActorRound): boolean {
  return actorRoundHasEffect(actorRound, ['stunned']);
}

export function findMaxActorRoundPace(actorId: string, actions: Action[]) {
  const paces = actions
    .filter((a) => a.actorId === actorId && a.actionType === 'movement')
    .map((a) => a.movement?.modifiers?.pace || 'creep');
  if (paces.length === 0) return 'creep';
  const valid = Array.from(new Set(paces)).filter((p) => PACE_ORDER.includes(p));
  if (valid.length === 0) return paces[0];
  valid.sort((a, b) => PACE_ORDER.indexOf(b) - PACE_ORDER.indexOf(a));
  return valid[0];
}
