import { AuthContextProps, useAuth } from 'react-oidc-context';
import { fetchHealingTables, HealingTables } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useQuery } from '@tanstack/react-query';
import { fetchFrightLevels, fetchPsychologyTables } from '../api/psychology';
import { FrightLevels, PsychologyTables } from '../api/psychology.dto';
import { useCombatGame } from '../combat/combat-context';

// Tables of rmu-api-core the dialogs read for their hints (spec 022). They change only on an import, so each one is
// fetched once per page load. They need the rmu-core-law role: without it, or before the import, the hook gives null
// and the dialogs fall back to what the API works out on its own.

const useCoreTable = <T>(key: string, fetcher: (auth: AuthContextProps) => Promise<T>): T | null => {
  const auth = useAuth();
  const { data } = useQuery({
    queryKey: ['core-table', key],
    queryFn: () => fetcher(auth),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });
  return data ?? null;
};

export const useHealingTables = () => useCoreTable<HealingTables>('healing-tables', fetchHealingTables);

export const usePsychologyTables = () => useCoreTable<PsychologyTables>('psychology-tables', fetchPsychologyTables);

/**
 * Fright levels of Table 14-3a, their modifiers and the thresholds of fallen allies, served by tactical to any
 * participant of the current game (workspace spec 068, S12 b): no rmu-core-law role needed. Null outside a game.
 */
export const useFrightLevels = (): FrightLevels | null => {
  const gameId = useCombatGame().gameId ?? null;
  return useCoreTable<FrightLevels | null>(`fright-levels:${gameId ?? ''}`, (auth) =>
    gameId ? fetchFrightLevels(gameId, auth) : Promise.resolve(null)
  );
};
