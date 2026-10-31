import type {
  HpLogEntry,
  Injury,
  InjurySource,
  ItemCoating,
  ItemCondition,
  PoisonExposure,
  PoisonRrResult,
  RollModifier,
  StrategicItemModifier,
} from '@labcabrera-rmu/rmu-react-shared-lib';

export type ActorRound = {
  id: string;
  gameId: string;
  factionId: string;
  actorId: string;
  actorName: string;
  round: number;
  movement: ActorRoundMovement;
  initiative: ActorRoundInitiative;
  actionPoints: number;
  hp: ActorRoundHp;
  fatigue: ActorRoundFatigue;
  penalty: ActorRoundPenalty;
  attacks: ActorRoundAttack[];
  effects: ActorRoundEffect[];
  /** Combat traits of the actor (talents and flaws) copied from its character (absent in older actor rounds). */
  traits?: ActorRoundTrait[];
  defense: ActorRoundDefense;
  /** Dodge and shield block declared this round (absent in actor rounds stored before them). */
  defenseMode?: ActorRoundDefenseMode;
  /** Action points spent in each action phase that has ended. */
  phaseLog?: ActorRoundPhaseLog[];
  /** Modifiers of the AP capacity, with their origin (spec 011, §1). */
  apModifiers?: ActorRoundApModifier[];
  /** AP of each action phase, index 0 is phase 1. */
  apCapacity?: number[];
  /** AP spent, lost or used by instantaneous actions, by phase and action (spec 011, §2). */
  apLedger?: ActorRoundApLedgerEntry[];
  alerts: ActorRoundAlert[];
  /** Injuries of the actor (spec 013): brought from its character and taken in the game. */
  injuries?: Injury[];
  /** Changes of the hit points in this round, with their origin (spec 013, §1.1; absent in older actor rounds). */
  hpLog?: HpLogEntry[];
  /** Strategic character of a character actor. */
  characterId?: string;
  /** Items of the actor, with their breakage (spec 019; absent in older actor rounds). */
  items?: ActorRoundItem[];
  /** Result of the breakage check, only in the answer of the check. */
  lastBreakageCheck?: BreakageCheckResult;
  /** `character` or `npc`. */
  actorType?: string;
  /** NPC of rmu-api-npcs an NPC actor comes from (spec 055): it has no character sheet, items, styles or spells. */
  npcId?: string;
  /** What the character brought into the game (only in the actor round built from it). */
  snapshot?: ActorRoundSnapshot;
  /** Hit points per round lost by the injuries that still bleed. */
  bleeding?: number;
  /** RR bonuses copied from the character (`fear`, `essence`...); absent in older actor rounds and for NPCs. */
  resistances?: ActorRoundResistance[];
  /** Fighting styles of the character (spec 032); absent in older actor rounds and for NPCs. */
  fightingStyles?: ActorRoundFightingStyle[];
  /** Style declared for the round; kept in the next rounds until changed. */
  activeStyle?: ActorRoundActiveStyle | null;
  imageUrl: string | undefined;
  /** Poisons that reached the actor and wait for their RR (spec 042). */
  poisonExposures?: PoisonExposure[];
};

export type ActorRoundStyleAbility = { abilityId: string; times: number };

export type ActorRoundFightingStyle = {
  skillId: string;
  styleId: string;
  ranks: number;
  freeRanks: number;
  abilities: ActorRoundStyleAbility[];
};

export type ActiveStyleAbility = ActorRoundStyleAbility & {
  /** The equipment the ability needs is there. */
  met: boolean;
  /** Attacks it works with; null is any. */
  attackNames: string[] | null;
};

export type ActorRoundActiveStyle = {
  skillId: string;
  styleId: string;
  /** The equipment of the style is there; otherwise the style gives nothing. */
  met: boolean;
  attackNames: string[] | null;
  /** OB of the free ranks (+2 each, at most +10). */
  freeRanksBonus: number;
  abilities: ActiveStyleAbility[];
  /** Requirements the game can't check (mounted, leadership...). */
  warnings: string[];
  /** Optional abilities used this round (killing-strike). */
  options: string[];
};

/** Optional abilities declared each round (spec 032). */
export const OPTIONAL_STYLE_ABILITIES = ['killing-strike'];

export type ActorRoundResistance = { resistance: string; totalBonus: number };

export type ActorRoundSnapshot = {
  hp: number;
  injuryIds: string[];
  conditionIds: string[];
};

export type ActorRoundMovement = {
  bmr: number;
  penalty: number;
  maxPace: string;
  baseDifficulty: string;
};

export type ActorRoundPenaltyModifier = {
  id: string;
  /** `injury` (the sum of the injuries, spec 013), `endurance`, `stunned`, `hp`, `fatigue`... `critical` is legacy. */
  source: string;
  value: number;
};

export type ActorRoundPenalty = {
  modifiers: ActorRoundPenaltyModifier[] | undefined;
};

export type ActorRoundInitiative = {
  base: number;
  penalty: number;
  roll: number;
  /** Strike Reflex bonus declared with the roll, already included in the total. */
  strikeReflex?: number;
  /** Reflexes bonus (spec 011), already included in the total. */
  reflexes?: number;
  /** Fighting style bonus (Lightning Reflexes, spec 032), already included in the total. */
  style?: number;
  total: number;
};

export type ApModifierKind = 'bonus' | 'loss' | 'cap' | 'cost-multiplier';

/** A change to the AP capacity of the round: AP gained or lost, a cap, or a cost multiplier. */
export type ActorRoundApModifier = {
  source: string;
  kind: ApModifierKind;
  value: number;
  /** Phase of a loss that falls in a given phase (staggered). */
  phase?: number;
  effectId?: string;
};

export type ApLedgerKind = 'spent' | 'lost' | 'instant';

export type ActorRoundApLedgerEntry = {
  phase: number;
  actionId?: string;
  ap: number;
  kind: ApLedgerKind;
};

/** Effects that change the action points of the round (spec 011), with the values `POST /effects` accepts. */
export const AP_EFFECTS: { status: string; defaultValue: number; min: number; max: number }[] = [
  { status: 'staggered', defaultValue: 1, min: 1, max: 4 },
  { status: 'haste', defaultValue: 1, min: 1, max: 4 },
  { status: 'speed', defaultValue: 1, min: 1, max: 4 },
  { status: 'reflexes', defaultValue: 1, min: 1, max: 3 },
  { status: 'adrenal-speed', defaultValue: 2, min: 1, max: 4 },
  { status: 'hold', defaultValue: 3, min: 1, max: 4 },
  { status: 'distraction', defaultValue: 1, min: 1, max: 3 },
  { status: 'ap-cap', defaultValue: 2, min: 0, max: 8 },
  { status: 'manual', defaultValue: 1, min: -8, max: 8 },
];

export type ActorRoundTrait = {
  traitId: string;
  tier: number;
  specialization: string | null;
};

export type ActorRoundHp = {
  max: number;
  current: number;
  /** Hits below zero the actor survives (Body Development bonus); `max` when missing. */
  deathThreshold?: number;
};

/** Dodge or shield block level (§9.6). `full` is only set by completing a 4 AP dodge action. */
export type DefenseLevel = 'none' | 'passive' | 'partial' | 'full';
/** Levels the game master declares directly. */
export const DECLARABLE_DEFENSE_LEVELS: DefenseLevel[] = ['none', 'passive', 'partial'];

export type ActorRoundDefenseMode = {
  dodge: DefenseLevel;
  block: DefenseLevel;
};

export type ActorRoundPhaseLog = {
  phase: number;
  spentAp: number;
  totalSpentAp: number;
};

export type ActorRoundAlertModifier = { key: string; value: number | null; modifier: string | null };

export type ActorRoundAlert = {
  id: string;
  type: string;
  message?: string;
  modifiers?: ActorRoundAlertModifier[] | null;
  status?: 'pending' | 'resolved';
};

/** An item of the actor in the game (spec 019): its strategic item with the modifiers it brought and the game ones. */
export type ActorRoundItem = {
  itemId: string;
  name: string;
  itemTypeId?: string;
  kind: 'weapon' | 'shield' | 'armor' | 'other';
  slot?: string;
  strength: number | null;
  modifiers: StrategicItemModifier[];
  startModifierIds: string[];
  condition: ItemCondition;
  /** Poison on the weapon (spec 042): the next hit spends it, a critical exposes the target. */
  coating?: ItemCoating | null;
  coatingSpent?: boolean;
};

/** `POST v1/actor-rounds/:id/poisonings/:exposureId/resolve` (spec 042). */
export type ResolvePoisoningResult = { actorRound: ActorRound; rr: PoisonRrResult; injuryId?: string };

/** `POST v1/actor-rounds/:id/injuries/:injuryId/antidote` (spec 042). */
export type ActorAntidoteResult = { actorRound: ActorRound; injuryId: string; neutralized: boolean };

export type BreakageResult = 'absolute-failure' | 'failure' | 'partial-success' | 'success' | 'absolute-success';

export type BreakageCheckResult = {
  itemId: string;
  roll: number;
  unmodified66: boolean;
  total: number;
  breakdown: { key: string; value: number }[];
  result: BreakageResult;
  modifier?: StrategicItemModifier;
};

/** `POST /actor-rounds/:id/breakage-checks`. */
export type BreakageCheckDto = {
  itemId: string;
  roll: number;
  unmodifiedRoll?: number;
  alertId?: string;
  strength?: number;
  modifiers?: { key: string; value: number }[];
};

export type ActorRoundFatigue = {
  endurance: number;
  fatigue: number;
  accumulator: number;
};

export type ActorRoundDefense = {
  bd: number;
  at: number | undefined;
  headAt: number | undefined;
  bodyAt: number | undefined;
  armsAt: number | undefined;
  legsAt: number | undefined;
  shield: ActorRoundDefenseShield | null;
  protect: number;
};

export type ActorRoundDefenseShield = {
  db: number;
};

export type ActorRoundEffect = {
  id: string;
  status: string;
  value: number | undefined;
  rounds: number | undefined;
  /** Foe the effect refers to (the target of `pressing-advantage`). */
  targetActorId?: string;
  /** Round and phase the effect was applied in, and the AP the actor had spent before it (set by the API). */
  appliedRound?: number;
  appliedPhase?: number;
  spentApBefore?: number;
  /** Where the effect comes from: the critical or fumble, or the strategic condition it was copied from (spec 013). */
  source?: InjurySource;
  /** First round a delayed effect counts in (spec 034). */
  fromRound?: number;
};

export type ActorRoundAttack = {
  attackName: string;
  baseBo: number;
  currentBo: number;
  type: 'melee' | 'ranged';
  attackTable: string;
  fumbleTable: string;
  attackSize: number;
  fumble: number;
  canThrow: boolean;
  ranges: ActorRoundAttackRange[] | undefined;
  twoHanded?: boolean;
  weaponCategory?: WeaponCategory;
  /** Item of the attack (spec 019). */
  itemId?: string | null;
  /** Breakage damage of its item in the game, already in `currentBo`. */
  breakagePenalty?: number;
  /** Its item broke in the game: it cannot be declared. */
  broken?: boolean;
};

/** Weapon kind for the multiple attacks bonuses (Table 9-7b). */
export type WeaponCategory = 'standard' | 'light' | 'dagger' | 'natural';

export type ActorRoundAttackRange = {
  from: number;
  to: number;
  bonus: number;
};

/** Procedures that can be done on an injury during a tactical game (spec 013, §3). */
export const TACTICAL_PROCEDURES = ['pressure', 'stitches', 'tourniquet', 'cauterize', 'dress', 'magic'] as const;
export type TacticalProcedure = (typeof TACTICAL_PROCEDURES)[number];

/** Healer and roll of a medical maneuver: an actor of the game (`healerActorId`) or an external healer. */
export type MedicalRollDto = {
  healerActorId?: string;
  healer?: { name: string; bonus: number };
  /** Open-ended roll. */
  roll: number;
  /** Difficulty modifier chosen by the game master; the API takes it from core's treatment table when missing. */
  difficulty?: number;
};

export type TreatInjuryDto = MedicalRollDto & {
  procedure: TacticalProcedure;
  /** First die of the open-ended roll, when it is not `roll` (66: unusual event of a cauterization). */
  unmodifiedRoll?: number;
  /** Cauterize: sum of the d10 of extra hits; rolled by the API when missing. */
  heatHitsRoll?: number;
  /** Cauterize: roll (1-100) of the heat critical; an alert for the game master when missing. */
  heatCriticalRoll?: number;
};

/** What a cauterization did besides the bleeding (Table 13-1c). */
export type HeatResult = {
  critical: string;
  hitsDice: number;
  hits: number;
  criticalRoll?: number;
  criticalDamage?: number;
  criticalText?: string;
  alertId?: string;
};

/** `PATCH v1/actor-rounds/:id/injuries/:injuryId` (game master). */
export type UpdateActorInjuryDto = Partial<
  Pick<
    Injury,
    | 'type'
    | 'severity'
    | 'location'
    | 'side'
    | 'penalty'
    | 'bleeding'
    | 'bleedingControl'
    | 'flags'
    | 'description'
    | 'status'
  >
>;

export type MedicalResult = 'absolute-failure' | 'failure' | 'partial-success' | 'success' | 'absolute-success';

/** Result of a treatment or a stabilization in a tactical game. */
export type MedicalResultDto = {
  actorRound: ActorRound;
  result: MedicalResult;
  roll: number;
  /** Medicine bonus of the healer. */
  bonus: number;
  /** Penalties of the healer actor (0 or negative). */
  healerPenalty: number;
  difficulty: number;
  /** roll + bonus + difficulty + healer penalty. */
  total: number;
  /** The total entry by entry, with the rules (spec 052). */
  breakdown?: RollModifier[];
  message?: string;
  recoveryModifier: number;
  treatment?: unknown;
  /** Severity of the heat critical the game master has to resolve (cauterize). */
  heatCritical?: string;
  /** Cauterize: extra hits and heat critical (workspace spec 022). */
  heat?: HeatResult;
  /** Cauterize: unmodified 66, the patient catches fire (game master). */
  unusualEvent?: boolean;
  /** Rounds the dying effect gained (stabilize). */
  roundsGained?: number;
};
