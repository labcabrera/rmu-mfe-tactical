import { useContext, useEffect, useState } from 'react';
import { AuthContextProps, useAuth } from 'react-oidc-context';
import { CombatContext } from '../../CombatContext';
import { fetchFrightLevels, fetchHealingTables } from '../api/psychology';
import { FrightLevels, HealingTables } from '../api/psychology.dto';

// Tables of rmu-api-core the dialogs read for their hints (spec 022). They change only on an import, so each one is
// fetched once per page load. They need the rmu-core-law role: without it, or before the import, the hook gives null
// and the dialogs fall back to what the API works out on its own.

const cache = new Map<string, Promise<unknown>>();

const useCoreTable = <T>(key: string, fetcher: (auth: AuthContextProps) => Promise<T>): T | null => {
  const auth = useAuth();
  const [value, setValue] = useState<T | null>(null);
  useEffect(() => {
    let active = true;
    if (!cache.has(key)) {
      cache.set(
        key,
        fetcher(auth).catch((err) => {
          cache.delete(key);
          throw err;
        })
      );
    }
    (cache.get(key) as Promise<T>).then((data) => active && setValue(data)).catch(() => active && setValue(null));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return value;
};

export const useHealingTables = () => useCoreTable<HealingTables>('healing-tables', fetchHealingTables);

/**
 * Fright levels of Table 14-3a, their modifiers and the thresholds of fallen allies, served by tactical to any
 * participant of the current game (workspace spec 068, S12 b): no rmu-core-law role needed. Null outside a game.
 */
export const useFrightLevels = (): FrightLevels | null => {
  const gameId = useContext(CombatContext)?.gameId ?? null;
  return useCoreTable<FrightLevels | null>(`fright-levels:${gameId ?? ''}`, (auth) =>
    gameId ? fetchFrightLevels(gameId, auth) : Promise.resolve(null)
  );
};
