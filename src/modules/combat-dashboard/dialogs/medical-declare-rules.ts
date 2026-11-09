import type { Injury } from '@labcabrera-rmu/rmu-react-shared-lib';
import type { MedicalProcedure } from '../../api/action.dto';
import type { ActorRound, ActorRoundEffect } from '../../api/actor-rounds.dto';

/** What the action treats: an injury of the patient, or its dying effect (stabilize). */
export type MedicalTarget = { kind: 'injury'; injury: Injury } | { kind: 'dying'; effect: ActorRoundEffect };

export const targetKey = (target: MedicalTarget) =>
  target.kind === 'injury' ? `injury:${target.injury.id}` : `dying:${target.effect.id}`;

/** Injuries still to treat and dying effects of an actor, the ones that bleed first. */
export const targetsOf = (actorRound: ActorRound | undefined): MedicalTarget[] => {
  if (!actorRound) return [];
  const dying = (actorRound.effects ?? [])
    .filter((effect) => effect.status === 'dying')
    .map((effect): MedicalTarget => ({ kind: 'dying', effect }));
  const injuries = (actorRound.injuries ?? [])
    .filter((injury) => injury.status !== 'healed' && !injury.poison)
    .sort((a, b) => (b.bleeding ?? 0) - (a.bleeding ?? 0))
    .map((injury): MedicalTarget => ({ kind: 'injury', injury }));
  return [...dying, ...injuries];
};

/** The procedure a target starts with: stabilize a dying actor, press a bleeding wound, dress any other one. */
export const defaultProcedure = (target: MedicalTarget | undefined): MedicalProcedure =>
  target?.kind === 'dying' ? 'stabilize' : (target?.injury.bleeding ?? 0) > 0 ? 'pressure' : 'dress';
