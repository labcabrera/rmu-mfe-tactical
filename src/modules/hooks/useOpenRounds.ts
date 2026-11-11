import { useCombatGame } from '../combat/combat-context';

/** Open rounds option of the strategic game (default true): unresolved actions go on in the next round. */
export const useOpenRounds = (): boolean => {
  const combatGame = useCombatGame();
  return combatGame.strategicGame?.options?.openRounds ?? true;
};
