import { useContext } from 'react';
import { CombatContext } from '../../CombatContext';
import { ActorRound } from '../api/actor-rounds.dto';

// Hook that provides skill-related helpers.
export function useSkillService() {
  const combat = useContext(CombatContext)!;

  /**
   * Return the numeric bonus for a skill for the character associated to the given actorRound.
   * If the character or the skill is not found, returns undefined.
   */
  function getSkillBonus(skillId: string, actorRound: ActorRound): number | undefined {
    if (!combat || !combat.characters) return undefined;
    const character = combat.characters.find((c) => c.id === actorRound.actorId);
    if (!character) return undefined;
    // Some Character typings in the repo don't include `skills` explicitly; guard with any
    const skills = (character as any).skills as Array<any> | undefined;
    if (!skills) return undefined;
    const skill = skills.find((s) => s.skillId === skillId || s.id === skillId);
    if (!skill) return undefined;
    // prefer common properties that may represent the total bonus
    if (typeof skill.totalBonus === 'number') return skill.totalBonus;
    if (typeof skill.bonus === 'number') return skill.bonus;
    return undefined;
  }

  return { getSkillBonus };
}

export default useSkillService;
