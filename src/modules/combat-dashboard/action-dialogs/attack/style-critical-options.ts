import { ActorRound } from '../../../api/actor-rounds.dto';

/** Fighting style abilities decided with the attack (spec 032, group C), as rmu-api-tactical defines them. */
export const ATTACK_STYLE_OPTIONS = ['leg-sweep', 'weapon-breaker', 'binding-chain'];
/** The ones that can still be chosen after the attack roll, before the critical roll. */
export const CRITICAL_STYLE_OPTIONS = ['overbearing', 'redirect', 'slowing-shot', 'lancers-knockback'];

const SEVERITIES = ['A', 'B', 'C', 'D', 'E'];

/** Options of the actor's active style that work with the attack, from the given list. */
export const styleOptionsFor = (
  actorRound: ActorRound | undefined,
  attackName: string,
  options: string[]
): string[] => {
  const style = actorRound?.activeStyle;
  if (!style?.met || (style.attackNames && !style.attackNames.includes(attackName))) return [];
  return style.abilities
    .filter((a) => a.met && (!a.attackNames || a.attackNames.includes(attackName)) && options.includes(a.abilityId))
    .map((a) => a.abilityId);
};

/** 5' per step of the severity before the option (A is 5'). */
export const severityFeet = (severity: string) => 5 * (SEVERITIES.indexOf(severity) + 1);
