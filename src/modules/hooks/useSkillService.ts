import { ActorRound } from '../api/actor-rounds.dto';
import { useCombatGame } from '../combat/combat-context';

/** One entry of an actor's sheet: a skill, with its specialization when it has one, and its total bonus. */
export type ActorSkill = { skillId: string; specialization: string | null; bonus: number };

// Hook that provides skill-related helpers.
export function useSkillService() {
  const combatGame = useCombatGame();

  /** The skills of the actor: from its character sheet, or from its stat block when it is an NPC (spec 093). */
  function getActorSkills(actorRound: ActorRound): ActorSkill[] {
    const npc = actorRound.npcId ? combatGame.npcs?.find((each) => each.id === actorRound.npcId) : undefined;
    if (npc) {
      return (npc.skills ?? []).map(({ skillId, specialization, bonus }) => ({
        skillId,
        specialization: specialization ?? null,
        bonus,
      }));
    }
    const character = combatGame.characters?.find((c) => c.id === actorRound.actorId);
    // Some Character typings in the repo don't include `skills` explicitly; guard with any
    const skills = ((character as any)?.skills ?? []) as Array<any>;
    return skills.flatMap((skill) => {
      // prefer common properties that may represent the total bonus
      const bonus = typeof skill.totalBonus === 'number' ? skill.totalBonus : skill.bonus;
      return typeof bonus === 'number'
        ? [{ skillId: skill.skillId ?? skill.id, specialization: skill.specialization ?? null, bonus }]
        : [];
    });
  }

  /**
   * Return the numeric bonus for a skill of the actor, of the given specialization when there is one. If the actor or
   * the skill is not found, returns undefined.
   */
  function getSkillBonus(skillId: string, actorRound: ActorRound, specialization?: string | null): number | undefined {
    const entries = getActorSkills(actorRound).filter((each) => each.skillId === skillId);
    const skill =
      specialization === undefined ? entries[0] : entries.find((each) => each.specialization === specialization);
    return skill?.bonus;
  }

  return { getActorSkills, getSkillBonus };
}
