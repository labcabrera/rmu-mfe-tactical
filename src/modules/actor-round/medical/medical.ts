import type { Character, HealerCandidate, Injury } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActorRound, TacticalProcedure } from '../../api/actor-rounds.dto';
import type { HealingTables } from '../../api/psychology.dto';
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

/** Difficulty of magic (not a Medicine maneuver, no row in core's table) and of every procedure without the table. */
const LEGACY_PROCEDURE_DIFFICULTY: Record<TacticalProcedure, string> = {
  pressure: 'e',
  stitches: 'm',
  tourniquet: 'vh',
  cauterize: 'r',
  dress: 'r',
  magic: 'm',
};

const HEAD_DIFFICULTY_STEPS = 1;
const CAUTERIZE_PENALTY_PER_BLEEDING = -5;

const difficultyValue = (key: string) => DIFFICULTY_LADDER.find(([k]) => k === key)?.[1] ?? 0;

/** Preview of the treatment difficulty, or why there is none: the API decides it the same way (spec 022, D4). */
export type DifficultyPreview =
  | { kind: 'value'; value: number; source: 'table' | 'legacy'; head: boolean; bleeding: number }
  | { kind: 'not-applicable' }
  | { kind: 'type-required' };

/**
 * Difficulty rmu-api-tactical applies when the game master sets none: the row of core's treatment table for the
 * procedure, type and severity (an unknown type takes the one its severity rows agree on), one step harder on the head
 * and harder by the bleeding when cauterizing. Magic, or a core without the table, uses the procedure's own one.
 */
export const previewTreatmentDifficulty = (
  procedure: TacticalProcedure,
  injury: Injury,
  tables: HealingTables | null
): DifficultyPreview => {
  const rows = tables?.treatmentDifficulties ?? [];
  const rules = tables?.treatmentRules;
  let key: string;
  let source: 'table' | 'legacy' = 'legacy';
  if (procedure === 'magic' || rows.length === 0) {
    key = LEGACY_PROCEDURE_DIFFICULTY[procedure];
  } else {
    const ofSeverity = rows.filter((row) => row.procedure === procedure && row.severity === injury.severity);
    const type = injury.type ?? 'unknown';
    const exact = ofSeverity.find((row) => row.injuryType === type);
    if (exact) key = exact.difficulty;
    else if (type === 'unknown' && ofSeverity.length > 0) {
      if (new Set(ofSeverity.map((row) => difficultyValue(row.difficulty))).size > 1) return { kind: 'type-required' };
      key = ofSeverity[0].difficulty;
    } else return { kind: 'not-applicable' };
    source = 'table';
  }
  const head = injury.location === 'head';
  let index = DIFFICULTY_LADDER.findIndex(([k]) => k === key);
  if (head) index = Math.min(index + (rules?.headDifficultySteps ?? HEAD_DIFFICULTY_STEPS), DIFFICULTY_LADDER.length - 1);
  const bleeding =
    procedure === 'cauterize'
      ? (rules?.cauterizePenaltyPerBleeding ?? CAUTERIZE_PENALTY_PER_BLEEDING) * Math.max(0, injury.bleeding ?? 0)
      : 0;
  return { kind: 'value', value: DIFFICULTY_LADDER[index][1] + bleeding, source, head, bleeding };
};

/** Stitches only close light and medium wounds (spec 022, decision 4). */
const STITCHABLE_SEVERITIES = ['light', 'medium'];

/** A dying actor is stabilized with a medium Medicine roll unless a difficulty is given. */
export const DEFAULT_STABILIZE_DIFFICULTY = 0;

/** A tourniquet only goes on a limb (or where the location is not known), and stitches not on a severe wound. */
export const isProcedureAvailable = (procedure: TacticalProcedure, injury: Injury): boolean => {
  if (procedure === 'stitches') return STITCHABLE_SEVERITIES.includes(injury.severity);
  return procedure !== 'tourniquet' || !injury.location || injury.location === 'arm' || injury.location === 'leg';
};

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
