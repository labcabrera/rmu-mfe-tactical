import { useTheme } from '@mui/material';
import { factionColor } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useCombatGame } from '../combat/combat-context';

/** Color of each faction of the current combat, by its position in the game's factions. */
export const useFactionColor = () => {
  const theme = useTheme();
  const { game } = useCombatGame();
  return (factionId: string | undefined) => factionColor(theme, game?.factions.indexOf(factionId ?? '') ?? -1);
};
