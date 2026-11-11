import type { Character } from '@labcabrera-rmu/rmu-react-shared-lib';

/** Why a character cannot join the game, as the API decides it (spec 013): dead or permanently unconscious. */
export function notAbleReason(character: Character): string | undefined {
  const open = (character.conditions || []).filter((condition) => !condition.resolvedAt);
  if (character.status === 'dead' || open.some((condition) => condition.status === 'dead')) return 'dead';
  if (open.some((condition) => condition.status === 'permanent-unconscious')) return 'condition-permanent-unconscious';
  return undefined;
}
