import { ActorRound } from '../api/actor-rounds.dto';

/** `unconscious` since spec 013; actor rounds stored before it may still have the legacy `unconcious`. */
const UNCONSCIOUS = ['unconscious', 'unconcious'];

/** Dead or unconscious: out of the fight, it neither rolls initiative nor declares actions. */
export function isActorRoundDown(actorRound: ActorRound): boolean {
  return actorRoundHasEffect(actorRound, ['dead', ...UNCONSCIOUS]);
}

/** Hit points per round the actor loses through its injuries (the API total, or the sum of the injuries). */
export function actorRoundBleeding(actorRound: ActorRound): number {
  if (typeof actorRound.bleeding === 'number') return actorRound.bleeding;
  return (actorRound.injuries ?? [])
    .filter((injury) => injury.status !== 'healed')
    .reduce((sum, injury) => sum + Math.max(0, injury.bleeding ?? 0), 0);
}

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

/** Routed or broken by fear (§14.3, spec 022): the API rejects its attacks (`err-action-fear`). */
export function isActorRoundFearBlocked(actorRound: ActorRound): boolean {
  return actorRoundHasEffect(actorRound, ['fear-routed', 'fear-broken']);
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

/** Grapples on the actor (workspace spec 077): `grappled` effects, each with its grappler and percent. */
export function actorRoundGrapples(actorRound: ActorRound): ActorRound['effects'] {
  return (actorRound.effects ?? []).filter((effect) => effect.status === 'grappled');
}

/**
 * The actor is grappled, or holds another actor of the round in a grapple (workspace spec 077, decision A3.5): to move
 * away it needs a contested Feat of Strength (`grappleFeat` of the movement).
 */
export function isActorRoundGrappling(actorRound: ActorRound, actorRounds: ActorRound[]): boolean {
  if (actorRoundGrapples(actorRound).length > 0) return true;
  return actorRounds.some(
    (other) =>
      other.id !== actorRound.id &&
      other.round === actorRound.round &&
      actorRoundGrapples(other).some((effect) => effect.targetActorId === actorRound.actorId)
  );
}

/** The attacks the actor can still use (workspace spec 082): not broken and, disarmed, only the ones of its body. */
export function usableAttacks(actorRound: ActorRound): ActorRound['attacks'] {
  const disarmed = actorRoundHasEffect(actorRound, ['disarmed', 'arm_useless']);
  return (actorRound.attacks ?? []).filter(
    (attack) =>
      !attack.broken &&
      (!disarmed ||
        attack.weaponCategory === 'natural' ||
        attack.weaponCategory === 'unarmed' ||
        !!attack.skillId?.startsWith('unarmed'))
  );
}
