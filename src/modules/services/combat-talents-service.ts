import {
  FALL_CONTROL_PURPOSE,
  GRAPPLE_ESCAPE_PURPOSE,
  COMBAT_TALENT_PURPOSE_TRAITS,
  COMBAT_TALENT_PURPOSES,
  CombatTalentPurpose,
  CriticalRerollKind,
  OpenEndedThresholds,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import type { Action } from '../api/action.dto';
import type { ActorRound, ActorRoundAttack, ActorRoundTrait } from '../api/actor-rounds.dto';

// Combat talents out of turn or on a roll (workspace spec 076, block B): what the board needs to offer them. The API
// checks and applies every rule; these helpers only decide what to show.

/** Talents of the palette and the maneuvers. */
export const SHARPSHOOTER = 'sharpshooter';
export const QUICKDRAW = 'quickdraw';
export const SLOW_ON_THE_DRAW = 'slow-on-the-draw';
export const QUICK_ACTION = 'quick-action';
/** Magical talent of the spell flow (workspace spec 077, decision C3): half or none of the PP of a failed cast. */
export const POWER_RECYCLING = 'power-recycling';
export const QUICK_CASTER = 'quick-caster';

/** The spell lists of the actor's Quick-Caster (workspace spec 077, decision C4), with their tier. */
export const quickCasterLists = (actorRound: ActorRound): { listCode: string; tier: number }[] =>
  (actorRound.traits ?? [])
    .filter((trait) => trait.traitId === QUICK_CASTER && !!trait.specialization)
    .map((trait) => ({ listCode: trait.specialization!, tier: trait.tier || 1 }));

/** Skill each combat talent maneuver rolls, as rmu-api-tactical checks it (`err-maneuver-purpose-skill`). */
export const COMBAT_TALENT_PURPOSE_SKILLS: Record<CombatTalentPurpose, { skillId: string; specialization?: string }> = {
  'battle-cry': { skillId: 'influence', specialization: 'intimidation' },
  'sense-weakness': { skillId: 'perception' },
  'study-offense': { skillId: 'perception' },
  precision: { skillId: 'ambush' },
};

/** Purposes made against a foe (`foeActorId`). */
export const FOE_PURPOSES: CombatTalentPurpose[] = ['sense-weakness', 'study-offense', 'precision'];

/**
 * Specialization matching of a trait (spec 008, §1), as rmu-api-tactical does it: none matches every skill,
 * `skillId@spec` that specialization only, a bare id every specialization of that skill or the weapon type after `@`.
 */
export const traitMatchesSkill = (specialization: string | null | undefined, skillId: string | null | undefined) => {
  if (!specialization) return true;
  if (!skillId) return false;
  if (specialization.includes('@')) return specialization === skillId;
  const [baseSkill, weaponType] = skillId.split('@');
  return specialization === baseSkill || specialization === weaponType;
};

const maxTier = (traits: ActorRoundTrait[]) => traits.reduce((max, trait) => Math.max(max, trait.tier || 1), 0);

/** Highest tier of a trait of the actor; 0 without it. */
export const traitTier = (actorRound: ActorRound | null | undefined, traitId: string): number =>
  maxTier((actorRound?.traits ?? []).filter((trait) => trait.traitId === traitId));

/** Highest tier of a trait of the actor taken for the skill of a weapon; 0 without it. */
export const traitTierForSkill = (
  actorRound: ActorRound | null | undefined,
  traitId: string,
  skillId: string | null | undefined
): number =>
  maxTier(
    (actorRound?.traits ?? []).filter(
      (trait) => trait.traitId === traitId && traitMatchesSkill(trait.specialization, skillId)
    )
  );

/** The open-ended thresholds of the actor's rolls (luck talents), for `RollField`'s `openEnded`. */
export const actorOpenEnded = (actorRound: ActorRound | null | undefined): OpenEndedThresholds | undefined =>
  actorRound?.rollProfile
    ? { highFrom: actorRound.rollProfile.highFrom, lowTo: actorRound.rollProfile.lowTo }
    : undefined;

/** Weapons of the actor a reaction talent can attack with: the ones of its specialization, not broken. */
export const reactionWeapons = (actorRound: ActorRound, traitId: string): ActorRoundAttack[] =>
  actorRound.attacks.filter(
    (attack) => attack.type === 'melee' && !attack.broken && traitTierForSkill(actorRound, traitId, attack.skillId) > 0
  );

/** Ranged weapons of the actor its Sharpshooter covers (with an item, which the aim action names). */
export const aimWeapons = (actorRound: ActorRound): ActorRoundAttack[] =>
  actorRound.attacks.filter(
    (attack) =>
      attack.type === 'ranged' &&
      !attack.broken &&
      !!attack.itemId &&
      traitTierForSkill(actorRound, SHARPSHOOTER, attack.skillId) > 0
  );

/** Combat talent maneuvers the actor can make with the skill: the ones of its talents that roll that skill. */
export const combatTalentPurposes = (actorRound: ActorRound | undefined, skillId: string): CombatTalentPurpose[] =>
  actorRound
    ? COMBAT_TALENT_PURPOSES.filter(
        (purpose) =>
          COMBAT_TALENT_PURPOSE_SKILLS[purpose].skillId === skillId &&
          traitTier(actorRound, COMBAT_TALENT_PURPOSE_TRAITS[purpose]) > 0
      )
    : [];

/** Combat talent maneuvers the actor has the talent of. */
export const availableCombatTalentPurposes = (actorRound: ActorRound): CombatTalentPurpose[] =>
  COMBAT_TALENT_PURPOSES.filter((purpose) => traitTier(actorRound, COMBAT_TALENT_PURPOSE_TRAITS[purpose]) > 0);

/**
 * Who can roll again the critical of an attack of `source` against `target` (workspace spec 076, decision B8), as the
 * API looks for it: the attacker with a `critical-reroll` of kind `offense` against the target (Sense Weakness), else
 * the target with one of kind `defense` against the attacker (Study Offense).
 */
export const criticalRerollKind = (
  source: ActorRound | undefined,
  target: ActorRound | undefined
): CriticalRerollKind | undefined => {
  const has = (holder: ActorRound | undefined, kind: CriticalRerollKind, foeId: string | undefined) =>
    !!foeId &&
    (holder?.effects ?? []).some(
      (effect) =>
        effect.status === 'critical-reroll' &&
        effect.targetActorId === foeId &&
        ((effect.data?.kind as string | undefined) ?? 'offense') === kind
    );
  if (has(source, 'offense', target?.actorId)) return 'offense';
  if (has(target, 'defense', source?.actorId)) return 'defense';
  return undefined;
};

const PURPOSE_STORAGE_KEY = 'rmu-tactical-maneuver-purpose';

/**
 * The combat talent a maneuver was declared for from the palette: a maneuver declaration has no purpose (the API takes
 * it when the maneuver is resolved), so the board remembers it for the session to preselect it. Storage may be
 * unavailable (private mode), hence the try/catch.
 */
export const rememberedPurpose = (actionId: string): CombatTalentPurpose | null => {
  try {
    const value = sessionStorage.getItem(`${PURPOSE_STORAGE_KEY}:${actionId}`);
    return value && (COMBAT_TALENT_PURPOSES as readonly string[]).includes(value)
      ? (value as CombatTalentPurpose)
      : null;
  } catch {
    return null;
  }
};

/** A maneuver to break free from grapples (workspace spec 077): resolved, or declared from the palette's "Break free". */
export const isGrappleEscapeAction = (action: Action): boolean => {
  if (action.actionType !== 'maneuver') return false;
  if (action.maneuver?.modifiers.purpose) return action.maneuver.modifiers.purpose === GRAPPLE_ESCAPE_PURPOSE;
  try {
    return sessionStorage.getItem(`${PURPOSE_STORAGE_KEY}:${action.id}`) === GRAPPLE_ESCAPE_PURPOSE;
  } catch {
    return false;
  }
};

/** A maneuver to control a fall (workspace spec 077): resolved, or declared from the palette's "Fall control". */
export const isFallControlAction = (action: Action): boolean => {
  if (action.actionType !== 'maneuver') return false;
  if (action.maneuver?.modifiers.purpose) return action.maneuver.modifiers.purpose === FALL_CONTROL_PURPOSE;
  try {
    return sessionStorage.getItem(`${PURPOSE_STORAGE_KEY}:${action.id}`) === FALL_CONTROL_PURPOSE;
  } catch {
    return false;
  }
};

export const rememberPurpose = (
  actionId: string,
  purpose: CombatTalentPurpose | typeof GRAPPLE_ESCAPE_PURPOSE | typeof FALL_CONTROL_PURPOSE
) => {
  try {
    sessionStorage.setItem(`${PURPOSE_STORAGE_KEY}:${actionId}`, purpose);
  } catch {
    // Only a convenience: without storage the purpose is chosen again in the maneuver.
  }
};
