import type { Character, HealerCandidate, Injury } from '@labcabrera-rmu/rmu-react-shared-lib';
import { HealingTables, requiresSurgery } from '@labcabrera-rmu/rmu-react-shared-lib';
import type { MedicalProcedure } from '../../api/action.dto';
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

/** A procedure on an injury: the tactical ones and those of a `medical` action (workspace spec 068). */
export type InjuryProcedure = TacticalProcedure | Exclude<MedicalProcedure, 'stabilize'>;

/** Difficulty of magic (not a Medicine maneuver, no row in core's table) and of every procedure without the table. */
const LEGACY_PROCEDURE_DIFFICULTY: Record<InjuryProcedure, string> = {
  pressure: 'e',
  stitches: 'm',
  tourniquet: 'vh',
  cauterize: 'r',
  dress: 'r',
  splint: 'm',
  cast: 'm',
  salve: 'r',
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
  procedure: InjuryProcedure,
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
  if (head)
    index = Math.min(index + (rules?.headDifficultySteps ?? HEAD_DIFFICULTY_STEPS), DIFFICULTY_LADDER.length - 1);
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

const onLimb = (injury: Injury) => !injury.location || injury.location === 'arm' || injury.location === 'leg';

/**
 * A tourniquet, a splint or a cast only go on a limb (or where the location is not known), and stitches not on a
 * severe wound.
 */
export const isProcedureAvailable = (procedure: InjuryProcedure, injury: Injury): boolean => {
  if (procedure === 'stitches') return STITCHABLE_SEVERITIES.includes(injury.severity);
  if (procedure === 'tourniquet' || procedure === 'splint' || procedure === 'cast') return onLimb(injury);
  return true;
};

/**
 * Why a procedure of a `medical` action does not apply to the injury, as an error key of the API; undefined when it
 * applies. Surgery is not offered in combat, and an injury that requires it only takes magic.
 */
export const medicalProcedureProblem = (
  procedure: InjuryProcedure,
  injury: Injury,
  tables: HealingTables | null
): string | undefined => {
  if (injury.status === 'healed') return 'err-injury-healed';
  if (injury.treatmentInProgress) return 'err-treatment-in-progress';
  if (procedure !== 'magic' && requiresSurgery(injury, tables?.surgeryRequired))
    return 'err-treatment-surgery-required';
  if (!isProcedureAvailable(procedure, injury))
    return procedure === 'stitches' ? 'err-treatment-invalid-severity' : 'err-treatment-invalid-location';
  return undefined;
};

/**
 * Rounds a procedure takes in combat (workspace spec 068, decision 2), as rmu-api-tactical works them out from core's
 * durations: per point of bleeding for pressure and stitches, at least 1. Undefined without core's table (the API
 * decides), null when core does not offer it in combat.
 */
export const medicalDurationRounds = (
  procedure: MedicalProcedure,
  injury: Injury | undefined,
  tables: HealingTables | null
): number | null | undefined => {
  const rows = tables?.treatmentDurations;
  if (!rows || rows.length === 0) return undefined;
  const row = rows.find((each) => each.procedure === procedure);
  if (!row) return 1;
  if (row.rounds === null || row.rounds === undefined) return null;
  const rounds = row.perBleeding ? row.rounds * Math.max(1, injury?.bleeding ?? 0) : row.rounds;
  return Math.max(1, rounds);
};

/** Effects that keep an actor from healing anyone (the API rejects it as a healer). */
const INCAPACITATED = ['dead', 'dying', 'unconscious', 'unconcious', 'incapacitated', 'paralyzed'];

/**
 * The actor can declare a `medical` action (workspace spec 068, decision 1): not down, stunned, routed nor broken
 * (`err-healer-not-able`).
 */
export const canHeal = (actorRound: ActorRound): boolean =>
  !actorRoundHasEffect(actorRound, [...INCAPACITATED, 'stunned', 'fear-routed', 'fear-broken']);

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
      return {
        id: actorRound.actorId,
        name: actorRound.actorName,
        medicine: medicine ?? 0,
        imageUrl: actorRound.imageUrl,
        factionId: actorRound.factionId,
      };
    });
