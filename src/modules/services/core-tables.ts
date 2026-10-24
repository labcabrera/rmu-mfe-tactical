import { useEffect, useState } from 'react';
import { AuthContextProps, useAuth } from 'react-oidc-context';
import { fetchHealingTables, fetchPsychologyTables } from '../api/psychology';
import { HealingTables, PsychologyTables } from '../api/psychology.dto';

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

export const usePsychologyTables = () => useCoreTable<PsychologyTables>('psychology-tables', fetchPsychologyTables);
