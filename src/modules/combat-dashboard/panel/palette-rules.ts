import { CombatActionType, CombatTalentPurpose } from '@labcabrera-rmu/rmu-react-shared-lib';
import { Action, ActionApProfile, ActionType, ForceReason } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';
import { actorRoundHasEffect } from '../../services/actor-round-service';
import {
  apFreeInPhase,
  apRemaining,
  DECLARE_AP_PROFILES,
  freeInstantsPerRound,
  hasNoCapacityInPhase,
  isActionOpen,
} from '../../services/ap-service';

export type PaletteEntry = {
  key: string;
  type: CombatActionType;
  label: string;
  freeAction?: boolean;
  /** Declared already forced (spec 011, §6): an immediate attack granted by an effect, out of turn and without AP. */
  forced?: ForceReason;
  /** Translation key of the reason why it cannot be declared now. */
  unavailable?: string;
  /** AP range of the entry ("2-4 AP"), shown under its name. */
  profile?: string;
  /** What declaring it does that the user should know: it will not reach its minimum AP, or interrupts an action. */
  warnings?: string[];
  /** AP range of the entry when its type does not give it (a combat talent maneuver). */
  ap?: ActionApProfile;
  /** Maneuver of a combat talent (workspace spec 076): declared with its skill, its purpose chosen in the flow. */
  purpose?: CombatTalentPurpose;
  /** "Break free" from the grapples of the actor (workspace spec 077): a percent maneuver of Wrestling or Contortions. */
  grappleEscape?: boolean;
  /** "Fall control" (workspace spec 077): an instantaneous Acrobatics maneuver, 0 AP, cited by a fall. */
  fallControl?: boolean;
  /** Fortitude (workspace spec 079, B4): an instantaneous absolute maneuver, 0 AP, that halves the penalties. */
  fortitude?: boolean;
  /** Lines shown under the entry: the grapples of "Break free", with their grappler and percent. */
  details?: string[];
};

export type PaletteGroup = { key: string; label: string; entries: PaletteEntry[] };

export type ManeuverChoice = { entry: PaletteEntry; skillId: string | null };

/** Palette entries declared as a maneuver with a fixed skill (the API resolves them as maneuvers). */
export const SKILL_MANEUVERS: Partial<Record<CombatActionType, string>> = { perception: 'perception' };

/** A healing item of 2 AP (workspace spec 068): a type of the API the shared lib does not list yet. */
export const USE_ITEM = 'use_item' as CombatActionType;

/** Actions on a weapon (workspace spec 076): the weapon drawn, or the foe and weapon aimed with. */
export const WEAPON_ENTRIES: CombatActionType[] = ['draw_and_load', 'aim'];

/** Spell casts are `cast_spell` actions; the instantaneous entry declares one as a free action. */
export const SPELL_ENTRIES: CombatActionType[] = ['cast_spell', 'cast_instant'];

/** The fear state of the actor (workspace spec 068), the worst one. */
export const actorFearState = (actorRound: ActorRound): string | undefined =>
  ['fear-broken', 'fear-routed', 'fear-retreat', 'fear-balk'].find((state) => actorRoundHasEffect(actorRound, [state]));

/** Phases of the round a declaration can go back to (workspace spec 089): the action phases before the current one. */
export const pastPhases = (currentPhase: number): number[] =>
  currentPhase >= 2 && currentPhase <= 4 ? Array.from({ length: currentPhase - 1 }, (_, index) => index + 1) : [];

/**
 * What the state of the actor allows in a phase of the round. A `phase` before `currentPhase` is a retroactive
 * declaration (workspace spec 089), which interrupts nothing and needs the AP of every phase gone by.
 */
export const paletteAvailability = (actorRound: ActorRound, actions: Action[], phase: number, currentPhase: number) => {
  const own = actions.filter((a) => a.actorId === actorRound.actorId);
  // A movement is declared only once per phase: none of the actor's movements may cover it (one not finished
  // yet covers up to the current phase, as in the API).
  const moving = own.some(
    (a) => a.actionType === 'movement' && a.phaseStart <= phase && phase <= (a.phaseEnd ?? phase)
  );
  // Declaring a new action interrupts the open one: its AP stay spent. Moving at the same time interrupts nothing, nor
  // do free actions.
  const interrupted = own.filter((a) => isActionOpen(a) && a.actionType !== 'movement' && !a.freeAction);
  // A flatfooted actor declares nothing this round, and one without AP in this phase (a surprised one loses its first
  // phases) declares nothing in it. The reasons reuse the messages of the API errors.
  const flatfooted = actorRound.effects?.some((e) => e.status === 'flatfooted');
  const surprise = actorRound.effects?.find((e) => e.status === 'surprised');
  const noCapacity = hasNoCapacityInPhase(actorRound, phase);
  const roundReason = flatfooted
    ? 'err-action-flatfooted'
    : noCapacity
      ? surprise
        ? 'err-action-surprised-phase'
        : 'no-ap-in-phase'
      : undefined;
  // Workspace spec 068, decision 14: routed and broken actors only move, dodge or take actions of 0 AP (the first
  // free action of the round); a retreating one cannot charge and a balking one is warned.
  const fear = actorFearState(actorRound);
  const fleeing = fear === 'fear-routed' || fear === 'fear-broken';
  // Quick Action (workspace spec 076): the first two instantaneous actions take no AP
  const firstFree =
    own.filter((a) => a.freeAction && !a.attacks?.length).length < freeInstantsPerRound(actorRound, 'other');
  const fearReason = (type: CombatActionType, free: boolean): string | undefined => {
    if (!fleeing || type === 'movement' || type === 'dodge' || (free && firstFree)) return undefined;
    return `palette-fear-only-flee-${fear}`;
  };
  // AP the actor can still spend this round: the open action gives back the AP of this phase when interrupted.
  const remaining = apRemaining(actorRound, phase) + (interrupted.length > 0 ? 1 : 0);
  const retroactive = phase < currentPhase;
  const phasesGoneBy = Array.from({ length: currentPhase - phase + 1 }, (_, index) => phase + index);
  const noApGoneBy = phasesGoneBy.some((each) => apFreeInPhase(actorRound, each) < 1);
  // The AP of a drawn weapon depend on the talents of the actor: the API has the last word on that one.
  const retroactiveReason = (type: CombatActionType, free: boolean): string | undefined => {
    if (!retroactive || free) return undefined;
    if (type !== 'movement' && interrupted.length > 0) return 'err-action-retroactive-open-action';
    return noApGoneBy && type !== 'draw_and_load' ? 'err-action-retroactive-no-ap' : undefined;
  };
  return { moving, interrupted, flatfooted, roundReason, fear, remaining, retroactive, fearReason, retroactiveReason };
};

export type PaletteAvailability = ReturnType<typeof paletteAvailability>;

/** The AP range of an entry: none for a free or forced one, else its own or the one of its type. */
export const entryApProfile = (type: CombatActionType, extra: Partial<PaletteEntry>): ActionApProfile | undefined =>
  extra.freeAction || extra.forced ? { min: 0, max: 0 } : (extra.ap ?? DECLARE_AP_PROFILES[type as ActionType]);

/**
 * Why an entry cannot be declared, the first reason that applies. A forced attack takes no AP: only a flatfooted actor
 * cannot make it.
 */
export const entryUnavailable = (
  availability: PaletteAvailability,
  type: CombatActionType,
  extra: Partial<PaletteEntry>
): string | undefined => {
  const free = !!extra.freeAction;
  return (
    (extra.forced ? (availability.flatfooted ? 'err-action-flatfooted' : undefined) : availability.roundReason) ??
    (extra.forced ? undefined : availability.retroactiveReason(type, free)) ??
    extra.unavailable ??
    (extra.forced ? undefined : availability.fearReason(type, free))
  );
};

/** The groups with the entries whose name contains the text, leaving out the groups without any. */
export const filterPaletteGroups = (groups: PaletteGroup[], filter: string): PaletteGroup[] => {
  const term = filter.trim().toLowerCase();
  return groups
    .map((group) => ({
      ...group,
      entries: group.entries.filter((e) => !term || e.label.toLowerCase().includes(term)),
    }))
    .filter((group) => group.entries.length > 0);
};
