/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { fetchItems, Item, useApiNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useQuery } from '@tanstack/react-query';

const NO_ITEMS: Item[] = [];

/** Catalog items of a category (poisons or herbs), loaded when `enabled` turns on (spec 042). */
export const useCatalogCategory = (category: 'poison' | 'herb', enabled: boolean): Item[] => {
  const auth = useAuth();
  const notify = useApiNotify();
  const query = useQuery<Item[], Error>({
    queryKey: ['poison-catalog', category],
    queryFn: () => fetchItems(`category==${category}`, 0, 1000, auth).then((page) => page.content),
    enabled,
    // A static catalog: once loaded it is not read again each time `enabled` turns on.
    staleTime: Infinity,
  });
  useEffect(() => {
    if (query.error) notify.error(query.error);
  }, [query.error]);
  return query.data ?? NO_ITEMS;
};
