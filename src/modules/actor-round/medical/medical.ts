import type { Character, HealerCandidate, Injury } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActorRound, TacticalProcedure } from '../../api/actor-rounds.dto';
import { actorRoundHasEffect } from '../../services/actor-round-service';

/** Difficulty ladder of the maneuvers, easiest first, with its modifiers (Table 4-1). */
const DIFFICULTY_LADDER: [string, number][] = [
  ['c', 70],
  ['s', 50],
  ['r', 30],
  ['e', 20],
  ['l', 10],
  ['m', 0],
  ['h', -10],
  ['vh', -20],
  ['xh', -30],
  ['sf', -50],
  ['a', -70],
  ['ni', -100],
];

/** Difficulty of each procedure (ch. 13), as rmu-api-tactical applies it when none is given. */
const PROCEDURE_DIFFICULTY: Record<TacticalProcedure, string> = {
  pressure: 'e',
  stitches: 'm',
  tourniquet: 'vh',
  cauterize: 'r',
  dress: 'r',
  magic: 'm',
};

/** Cauterizing is harder by 5 per point of bleeding. */
const CAUTERIZE_PENALTY_PER_BLEEDING = 5;

/**
 * Difficulty modifier the API uses when the request has none: the one of the procedure, one step harder on the head,
 * and harder by the bleeding when cauterizing. Shown as a hint: the API computes it.
 */
export const defaultTreatmentDifficulty = (procedure: TacticalProcedure, injury: Injury): number => {
  let index = DIFFICULTY_LADDER.findIndex(([key]) => key === PROCEDURE_DIFFICULTY[procedure]);
  if (injury.location === 'head') index = Math.min(index + 1, DIFFICULTY_LADDER.length - 1);
  let value = DIFFICULTY_LADDER[index][1];
  if (procedure === 'cauterize') value -= CAUTERIZE_PENALTY_PER_BLEEDING * Math.max(0, injury.bleeding ?? 0);
  return value;
};

/** A dying actor is stabilized with a medium Medicine roll unless a difficulty is given. */
export const DEFAULT_STABILIZE_DIFFICULTY = 0;

/** A tourniquet only goes on a limb (or where the location is not known). */
export const isProcedureAvailable = (procedure: TacticalProcedure, injury: Injury): boolean =>
  procedure !== 'tourniquet' || !injury.location || injury.location === 'arm' || injury.location === 'leg';

/** Effects that keep an actor from healing anyone (the API rejects it as a healer). */
const INCAPACITATED = ['dead', 'dying', 'unconscious', 'unconcious', 'incapacitated', 'paralyzed'];

const MEDICINE_SKILL_ID = 'medicine';

/**
 * Actors of the round who can heal, by actor id, with the Medicine bonus of their character (the API reads the same
 * one; an NPC heals with 0).
 */
export const healerCandidates = (actorRounds: ActorRound[], characters: Character[]): HealerCandidate[] =>
  actorRounds
    .filter((actorRound) => !actorRoundHasEffect(actorRound, INCAPACITATED))
    .map((actorRound) => {
      const character = characters.find((c) => c.id === (actorRound.characterId ?? actorRound.actorId));
      const medicine = character?.skills?.find((skill) => skill.skillId === MEDICINE_SKILL_ID)?.totalBonus;
      return { id: actorRound.actorId, name: actorRound.actorName, medicine: medicine ?? 0 };
    });
