import type { ActorRound } from './actor-rounds.dto';

// Psychology of the tactical game (workspace spec 022, §14.3): the fear RR of an actor, the fear, morale and rally
// checks of a group, and the tables of rmu-api-core they read. Only keys and numbers: the texts live in the locales.

export type KeyValueModifier = { key: string; value: number };

/** Severity of a failed RR, and the fear state it gives. */
export type FearSeverity = 'mild' | 'moderate' | 'severe' | 'extreme';
export type FearState = 'balk' | 'retreat' | 'routed' | 'broken';

/** Effects a failed fear RR leaves in the actor round, the worst kept. */
export const FEAR_EFFECTS = ['fear-balk', 'fear-retreat', 'fear-routed', 'fear-broken'] as const;

/** `POST /v1/actor-rounds/{id}/resistance-rolls`. */
export type ResistanceRollDto = {
  /** `physical` only for an actor dying in frenzy (spec 040). */
  kind: 'fear' | 'physical';
  /** Spec 040: the RR of a frenzy-dying actor, at attack level 0; the API kills it when it fails. */
  reason?: 'frenzy-dying';
  /** Attack level: the fright level for fear. */
  attackLevel: number;
  /** Open-ended roll. */
  roll: number;
  modifiers?: KeyValueModifier[];
  /** RR bonus of an actor without one in its sheet (NPCs); it wins over the sheet. */
  bonus?: number;
};

export type ResistanceRollResult = {
  actorRoundId: string;
  actorId: string;
  kind: string;
  roll: number;
  bonus: number;
  attackLevel: number;
  breakdown: KeyValueModifier[];
  total: number;
  required: number;
  resisted: boolean;
  /** How much the total fell short; 0 when it resisted. */
  failure: number;
  result?: string;
  severity?: FearSeverity;
  fearState?: FearState;
  rallyModifier?: number;
};

/** Who takes a group check: every actor of the factions, and the actors picked one by one. */
export type GroupSelection = { factionIds?: string[]; actorIds?: string[] };

export type LeaderRequest = {
  actorId: string;
  /** The followers acknowledge the leader and know it is there. */
  recognized?: boolean;
  /** Leadership of a leader without a sheet (NPC). */
  leadershipRanks?: number;
  leadershipBonus?: number;
};

type GroupCheckDto = { group?: GroupSelection; modifiers?: KeyValueModifier[] };

export type FearCheckDto = GroupCheckDto & {
  leader?: LeaderRequest;
  /** Fright level (Table 14-3a), or the Intimidation ranks of an actor. */
  frightLevel?: number;
  intimidatorActorId?: string;
  intimidationRanks?: number;
  /** Rolls and RR bonuses by actor id; a missing roll is rolled by the API. */
  rolls?: Record<string, number>;
  bonuses?: Record<string, number>;
};

export type LeaderRollDto = GroupCheckDto & {
  leader: LeaderRequest;
  /** Open-ended roll of the leader; rolled by the API when missing. */
  roll?: number;
  unmodifiedRoll?: number;
};

export type MoraleCheckDto = LeaderRollDto & { difficulty?: string; bonuses?: Record<string, number> };

export type GroupCheckKind = 'fear' | 'morale' | 'rally';

export type ActorCheckStatus = 'skipped' | 'resisted' | 'afraid' | 'follower';

export type ActorCheckResult = {
  actorId: string;
  actorRoundId: string;
  actorName: string;
  factionId: string;
  status: ActorCheckStatus;
  roll?: number;
  rolledByServer?: boolean;
  bonus?: number;
  breakdown?: KeyValueModifier[];
  total?: number;
  required?: number;
  failure?: number;
  severity?: FearSeverity;
  previousEffect?: string;
  effect?: string;
  /** `no-attacks` for routed and broken actors. */
  restrictions: string[];
  /** `no-fear-rr-bonus`... */
  warnings: string[];
};

export type GroupCheckResult = {
  kind: GroupCheckKind;
  gameId: string;
  round: number;
  leader?: {
    actorId: string;
    actorRoundId: string;
    recognized: boolean;
    leadershipRanks: number;
    leadershipBonus: number;
    lookOfEaglesTier: number;
    fearRrBonus: number;
  };
  frightLevel?: number;
  leaderRoll?: {
    roll: number;
    rolledByServer: boolean;
    breakdown: KeyValueModifier[];
    total: number;
    result?: string;
    unusualEvent?: { roll: number; outcome: string; leaderFearRrBonus?: number; leaderHits?: number; durationDays?: number };
  };
  /** Morale: refuses-hostile, refuses, needs-clarification, obeys, inspired, misunderstands-order. */
  outcome?: string;
  moraleModifier?: number;
  moraleModifierDays?: number;
  /** Rally: steps of fear severity (negative calms down). */
  fearSeverityChange?: number;
  actors: ActorCheckResult[];
  actorRounds: ActorRound[];
};

/** `GET /v1/psychology-tables` of rmu-api-core: only what the UI reads. */
export type PsychologyTables = {
  frightLevels: { key: string; level: number }[];
  frightLevelModifiers: { key: string; level: number }[];
};

/** A row of the treatment difficulty table of rmu-api-core (`GET /v1/healing-tables`). */
export type TreatmentDifficultyRow = { procedure: string; injuryType: string; severity: string; difficulty: string };

export type TreatmentRules = { headDifficultySteps: number; cauterizePenaltyPerBleeding: number };

export type HealingTables = { treatmentDifficulties?: TreatmentDifficultyRow[]; treatmentRules?: TreatmentRules };
