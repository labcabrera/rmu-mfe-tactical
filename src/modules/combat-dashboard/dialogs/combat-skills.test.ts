import { describe, expect, it } from 'vitest';
import type { ActorSkill } from '../../hooks/useSkillService';
import { bestBonus, developedSpecializations, entriesOf, isCombatSkill, needsSpecialization } from './combat-skills';

const entry = (specialization: string | null, bonus: number, skillId = 'influence'): ActorSkill => ({
  skillId,
  specialization,
  bonus,
});

describe('isCombatSkill', () => {
  it.each(['crafting', 'composition', 'science', 'vocation', 'combat-training', 'spellcasting'])(
    'excludes the category %s',
    (categoryId) => expect(isCombatSkill({ id: 'any', categoryId })).toBe(false)
  );

  it.each(['historic-lore', 'spell-lore', 'combat-styles', 'body-development'])('excludes the skill %s', (id) =>
    expect(isCombatSkill({ id, categoryId: 'lore' })).toBe(false)
  );

  it.each(['language-spoken', 'language-written', 'language-sign', 'creature-lore'])('keeps the lore %s', (id) =>
    expect(isCombatSkill({ id, categoryId: 'lore' })).toBe(true)
  );

  it('keeps the rest', () => expect(isCombatSkill({ id: 'influence', categoryId: 'social' })).toBe(true));
});

describe('the specializations of an actor', () => {
  const skills = [entry('seduction', 12), entry('intimidation', 0), entry(null, 40, 'running')];

  it('reads the entries of one skill', () => expect(entriesOf(skills, 'influence')).toHaveLength(2));

  it('lists the developed ones, best first', () =>
    expect(developedSpecializations(entriesOf(skills, 'influence')).map((each) => each.specialization)).toEqual([
      'seduction',
      'intimidation',
    ]));

  it('shows the best bonus, or nothing without the skill', () => {
    expect(bestBonus(entriesOf(skills, 'influence'))).toBe(12);
    expect(bestBonus(entriesOf(skills, 'climbing'))).toBeUndefined();
  });
});

describe('needsSpecialization', () => {
  const skill = { specialization: 'skill-influence', specializationOptional: false };

  it('asks for it when the skill has one', () => expect(needsSpecialization(skill, [])).toBe(true));
  it('does not when it is optional', () =>
    expect(needsSpecialization({ ...skill, specializationOptional: true }, [])).toBe(false));
  it('does not when the skill has none', () =>
    expect(needsSpecialization({ specialization: null, specializationOptional: false }, [])).toBe(false));
  it('does not when the sheet keeps the skill without one', () =>
    expect(needsSpecialization(skill, [entry(null, 10)])).toBe(false));
});
