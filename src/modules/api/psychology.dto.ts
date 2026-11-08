import type { TemporaryModifier } from '@labcabrera-rmu/rmu-react-shared-lib';
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
  /** The alert the RR answers (workspace spec 087): the API closes it with the result. */
  alertId?: string;
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
  /** Workspace spec 068: an NPC of the game whose fright level is the attack level when `frightLevel` is missing. */
  frightSourceActorId?: string;
  /** Added to the fright level of `frightSourceActorId` (+3, +5 for the supernatural). */
  frightLevelModifier?: number;
  intimidatorActorId?: string;
  intimidationRanks?: number;
  /** The `fear-check-suggested` alert the check answers (workspace spec 087): the API closes it with the result. */
  alertId?: string;
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
    unusualEvent?: {
      roll: number;
      outcome: string;
      leaderFearRrBonus?: number;
      leaderHits?: number;
      durationDays?: number;
    };
  };
  /** Morale: refuses-hostile, refuses, needs-clarification, obeys, inspired, misunderstands-order. */
  outcome?: string;
  moraleModifier?: number;
  moraleModifierDays?: number;
  /** Rally: steps of fear severity (negative calms down). */
  fearSeverityChange?: number;
  /** Workspace spec 068: the lasting modifiers the check gave the leader. */
  temporaryModifiers?: TemporaryModifier[];
  actors: ActorCheckResult[];
  actorRounds: ActorRound[];
};

/** `POST /v1/actor-rounds/{id}/fear-effects` (workspace spec 068): the result of an individual fear RR. */
export type ApplyFearEffectDto = { severity: FearSeverity; source?: { actorId?: string; name?: string } };

/** A threshold of fallen allies of a faction (Table 14-3a): above (`exclusive`) or at least `minShare`. */
export type FallenThreshold = { minShare: number; exclusive: boolean; frightLevel: number };

/** `GET /v1/tactical-games/{id}/fright-levels` (workspace spec 068, S12 b): for any participant of the game. */
export type FrightLevels = {
  frightLevels: { key: string; level: number }[];
  frightLevelModifiers: { key: string; level: number }[];
  fallenThresholds: FallenThreshold[];
};

/** Band of a table: bounds included, null is open. */
export type TableRange = { min: number | null; max: number | null };

/** The part of `GET /v1/psychology-tables` of rmu-api-core that explains the group checks (§14.3). */
export type PsychologyTables = {
  fearResults: (TableRange & { result: string; rallyModifier: number })[];
  morale: (TableRange & {
    result: string;
    outcome: string;
    moraleModifier: number;
    moraleModifierDays: number | null;
  })[];
  moraleUnusualEvent: { roll: number };
  rally: (TableRange & { result: string; fearSeverityChange: number })[];
  rallyUnusualEvent: { roll: number; leaderFearRrBonus: number; leaderHits: number; durationDays: number };
  rallyGroupModifier: { followersPerStep: number; modifier: number };
};

/** A row of the treatment difficulty table of rmu-api-core (`GET /v1/healing-tables`). */
export type TreatmentDifficultyRow = { procedure: string; injuryType: string; severity: string; difficulty: string };

export type TreatmentRules = { headDifficultySteps: number; cauterizePenaltyPerBleeding: number };

/** Rounds a procedure takes in combat (workspace spec 068); null: not offered in a tactical game. */
export type TreatmentDuration = { procedure: string; rounds: number | null; perBleeding: boolean };

export type HealingTables = {
  treatmentDifficulties?: TreatmentDifficultyRow[];
  treatmentRules?: TreatmentRules;
  /** Workspace spec 068: rounds of each procedure, the injuries that only admit surgery and the salve range. */
  treatmentDurations?: TreatmentDuration[] | null;
  surgeryRequired?: { injuryType: string; severity: string }[] | null;
  salveModifier?: { min: number; max: number } | null;
};
