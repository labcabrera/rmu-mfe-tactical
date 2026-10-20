import { Action } from '../api/action.dto';
import { ActorRound } from '../api/actor-rounds.dto';

const PACE_ORDER = ['creep', 'walk', 'jog', 'run', 'sprint', 'dash'];

/** The API spells it `unconcious`; the correct spelling is also accepted. */
const UNCONSCIOUS = ['unconcious', 'unconscious'];

export function isActorRoundDead(actorRound: ActorRound): boolean {
  return actorRoundHasEffect(actorRound, ['dead', ...UNCONSCIOUS]);
}

/** `dead`, `unconscious` or undefined: the state that takes the actor out of the fight, dead first. */
export function actorRoundDownState(actorRound: ActorRound): 'dead' | 'unconscious' | undefined {
  if (actorRoundHasEffect(actorRound, ['dead'])) return 'dead';
  if (actorRoundHasEffect(actorRound, UNCONSCIOUS)) return 'unconscious';
  return undefined;
}

/** Surprise state of the round (§8.3 Surprise), set by the game master. */
export function isActorRoundFlatfooted(actorRound: ActorRound): boolean {
  return actorRoundHasEffect(actorRound, ['flatfooted']);
}

export function actorRoundHasEffect(actorRound: ActorRound, statuses: string[]): boolean {
  return actorRound.effects?.some((se) => statuses.includes(se.status)) || false;
}

/**
 * Unconscious or dead: it cannot defend. A stunned actor only takes the stun penalty (§9.8 Stun), and the API
 * leaves out the shield and Quickness DB of a flatfooted one on its own.
 */
export function isActorRoundDisabled(actorRound: ActorRound): boolean {
  return actorRoundHasEffect(actorRound, [...UNCONSCIOUS, 'dead']);
}

export function isActorRoundProne(actorRound: ActorRound): boolean {
  return actorRoundHasEffect(actorRound, ['prone', ...UNCONSCIOUS, 'dead']);
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
