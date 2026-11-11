import type { Skill } from '@labcabrera-rmu/rmu-react-shared-lib';
import type { ActorSkill } from '../../hooks/useSkillService';

/** Categories whose skills are not maneuvers of a combat: crafts and studies, attacks and spells (their own actions). */
export const NON_COMBAT_CATEGORIES: ReadonlySet<string> = new Set([
  'crafting',
  'composition',
  'science',
  'vocation',
  'combat-training',
  'spellcasting',
]);

/** Skills of the other categories that are not maneuvers of a combat: lores and passive skills. */
export const NON_COMBAT_SKILLS: ReadonlySet<string> = new Set([
  'historic-lore',
  'materials-lore',
  'racial-lore',
  'region-lore',
  'religion-lore',
  'spell-lore',
  'battle-styles',
  'combat-styles',
  'discipline-styles',
  'body-development',
  'weight-training',
  'power-development',
]);

export const isCombatSkill = (skill: Pick<Skill, 'id' | 'categoryId'>): boolean =>
  !NON_COMBAT_CATEGORIES.has(skill.categoryId) && !NON_COMBAT_SKILLS.has(skill.id);

/** The actor's entries of a skill. */
export const entriesOf = (skills: ActorSkill[], skillId: string): ActorSkill[] =>
  skills.filter((each) => each.skillId === skillId);

/** The specializations the actor has developed in a skill, best bonus first. */
export const developedSpecializations = (entries: ActorSkill[]): (ActorSkill & { specialization: string })[] =>
  entries
    .filter((each): each is ActorSkill & { specialization: string } => !!each.specialization)
    .sort((a, b) => b.bonus - a.bonus);

/** What a skill's card shows: the best bonus of its entries, or nothing when the actor does not have it. */
export const bestBonus = (entries: ActorSkill[]): number | undefined =>
  entries.length === 0 ? undefined : Math.max(...entries.map((each) => each.bonus));

/**
 * A skill whose declaration needs a specialization. A sheet that keeps the skill without one rolls with that entry
 * (`ManeuverBaseModifiersService.skillBonus`), so it does not need it.
 */
export const needsSpecialization = (
  skill: Pick<Skill, 'specialization' | 'specializationOptional'>,
  entries: ActorSkill[]
): boolean => !!skill.specialization && !skill.specializationOptional && !entries.some((each) => !each.specialization);
