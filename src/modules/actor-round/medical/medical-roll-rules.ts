import {
  AMPUTATION_DIFFICULTY,
  BodySide,
  DEFIBRILLATION_DIFFICULTY_RANGE,
  HealerCandidate,
  HealerSelection,
  HealingTables,
  Injury,
  LostLimbLocation,
  resolveHealer,
  REVIVE_DIFFICULTY,
  ReviveMethod,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import type {
  ActorRoundEffect,
  AmputateActorLimbRequest,
  AmputationResultDto,
  MedicalResultDto,
  MedicalRollDto,
  ReviveActorRequest,
  ReviveResultDto,
  TacticalProcedure,
  TreatInjuryDto,
} from '../../api/actor-rounds.dto';
import { DEFAULT_STABILIZE_DIFFICULTY, DifficultyPreview, previewTreatmentDifficulty } from './medical';

/**
 * What the medical roll is for: treating an injury, or stabilizing a dying actor. Workspace spec 079: an emergency
 * amputation (from an injury of the limb or not) and the revival of a dead body.
 */
export type MedicalTarget =
  | { kind: 'treat'; injury: Injury }
  | { kind: 'stabilize'; effect: ActorRoundEffect }
  | { kind: 'amputate'; injury?: Injury }
  | { kind: 'revive' };

export type MedicalResponse = MedicalResultDto & Partial<AmputationResultDto> & Partial<ReviveResultDto>;

/** The choices of the dialog: those of every roll, then those of a cauterization, an amputation and a revival. */
export type MedicalRollForm = {
  healer: HealerSelection;
  procedure: TacticalProcedure;
  difficulty: number | null;
  roll: number | null;
  unmodified: number | null;
  heatHitsRoll: number | null;
  heatCriticalRoll: number | null;
  location: LostLimbLocation;
  side: BodySide;
  systemShockRoll: number | null;
  method: ReviveMethod;
  defibrillation: number | null;
  dangerousSource: boolean;
  shockHitsRoll: number | null;
};

/** The limb of an injury on an arm or a leg. */
const limbOf = (injury?: Injury): LostLimbLocation =>
  injury?.location === 'leg' || injury?.location === 'arm' ? injury.location : 'arm';

/** Another actor of the round heals by default, then the patient itself, then an external healer. */
export const initialHealer = (candidates: HealerCandidate[], patientId: string): HealerSelection => {
  const other = candidates.find((candidate) => candidate.id !== patientId);
  if (other) return { mode: 'character', characterId: other.id };
  return candidates.some((candidate) => candidate.id === patientId)
    ? { mode: 'self' }
    : { mode: 'external', name: '', medicine: 0 };
};

/** A new target starts a new roll: an injury that does not bleed is dressed, and an amputation takes the injury's limb. */
export const initialMedicalForm = (target: MedicalTarget | null, healer: HealerSelection): MedicalRollForm => {
  const amputated = target?.kind === 'amputate' ? target.injury : undefined;
  return {
    healer,
    procedure: target?.kind === 'treat' && (target.injury.bleeding ?? 0) === 0 ? 'dress' : 'pressure',
    difficulty: null,
    roll: null,
    unmodified: null,
    heatHitsRoll: null,
    heatCriticalRoll: null,
    location: limbOf(amputated),
    side: amputated?.side ?? 'left',
    systemShockRoll: null,
    method: 'respiratory',
    defibrillation: null,
    dangerousSource: false,
    shockHitsRoll: null,
  };
};

/** The difficulty of a roll that does not read core's table: by the procedure of an amputation or a revival. */
const fixedDifficulty = (target: MedicalTarget, form: MedicalRollForm): number => {
  if (target.kind === 'amputate') return AMPUTATION_DIFFICULTY.emergency;
  if (target.kind !== 'revive') return DEFAULT_STABILIZE_DIFFICULTY;
  return form.method === 'defibrillation'
    ? (form.defibrillation ?? DEFIBRILLATION_DIFFICULTY_RANGE.max)
    : REVIVE_DIFFICULTY[form.method];
};

/** The difficulty the roll will have when the game master sets none. */
export const medicalDifficultyPreview = (
  target: MedicalTarget,
  form: MedicalRollForm,
  tables: HealingTables | null
): DifficultyPreview =>
  target.kind === 'treat'
    ? previewTreatmentDifficulty(form.procedure, target.injury, tables)
    : { kind: 'value', value: fixedDifficulty(target, form), source: 'legacy', head: false, bleeding: 0 };

const defibrillationInRange = (target: MedicalTarget, form: MedicalRollForm): boolean =>
  target.kind !== 'revive' ||
  form.method !== 'defibrillation' ||
  form.defibrillation === null ||
  (form.defibrillation >= DEFIBRILLATION_DIFFICULTY_RANGE.min &&
    form.defibrillation <= DEFIBRILLATION_DIFFICULTY_RANGE.max);

/** The roll can be sent. Without a row of the table the API rejects a treatment unless the difficulty is set. */
export const medicalRollReady = (
  target: MedicalTarget,
  form: MedicalRollForm,
  preview: DifficultyPreview,
  healerResolved: boolean,
  limbLost: boolean
): boolean =>
  healerResolved &&
  form.roll !== null &&
  Number.isFinite(form.roll) &&
  (preview.kind === 'value' || form.difficulty !== null) &&
  !limbLost &&
  defibrillationInRange(target, form);

type ResolvedHealer = NonNullable<ReturnType<typeof resolveHealer>>;

/** The fields of every medical roll. A revival takes its difficulty from the method. */
export const medicalRollDto = (
  target: MedicalTarget,
  form: MedicalRollForm,
  healer: ResolvedHealer,
  roll: number
): MedicalRollDto => ({
  ...(healer.external
    ? { healer: { name: healer.name, bonus: healer.medicine } }
    : { healerActorId: healer.characterId }),
  roll,
  ...(form.difficulty !== null && target.kind !== 'revive' ? { difficulty: form.difficulty } : {}),
});

export const amputationRequest = (
  dto: MedicalRollDto,
  form: MedicalRollForm,
  injury: Injury | undefined
): AmputateActorLimbRequest => ({
  ...dto,
  location: form.location,
  side: form.side,
  ...(injury ? { injuryId: injury.id } : {}),
  ...(form.systemShockRoll !== null ? { systemShockRoll: form.systemShockRoll } : {}),
});

/** Only a defibrillation sends its difficulty, its source and the hits of its shock. */
export const reviveRequest = (dto: MedicalRollDto, form: MedicalRollForm): ReviveActorRequest => {
  const defibrillation = form.method === 'defibrillation';
  return {
    ...(dto.healer ? { healer: dto.healer } : { healerActorId: dto.healerActorId }),
    roll: dto.roll,
    method: form.method,
    ...(defibrillation && form.defibrillation !== null ? { defibrillationDifficulty: form.defibrillation } : {}),
    ...(defibrillation ? { dangerousSource: form.dangerousSource } : {}),
    ...(defibrillation && form.dangerousSource && form.shockHitsRoll !== null
      ? { shockHitsRoll: form.shockHitsRoll }
      : {}),
  };
};

/** The heat dice go only with a cauterization, and the first die only when it differs from the total. */
export const treatmentRequest = (dto: MedicalRollDto, form: MedicalRollForm): TreatInjuryDto => {
  const cauterize = form.procedure === 'cauterize';
  return {
    ...dto,
    procedure: form.procedure,
    ...(form.unmodified !== null && form.unmodified !== dto.roll ? { unmodifiedRoll: form.unmodified } : {}),
    ...(cauterize && form.heatHitsRoll !== null ? { heatHitsRoll: form.heatHitsRoll } : {}),
    ...(cauterize && form.heatCriticalRoll !== null ? { heatCriticalRoll: form.heatCriticalRoll } : {}),
  };
};
