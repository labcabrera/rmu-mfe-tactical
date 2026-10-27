/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { fetchItems, Item } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useTacticalNotify } from '../../services/notify-service';

/** Catalog items of a category (poisons or herbs), loaded when `enabled` turns on (spec 042). */
export const useCatalogCategory = (category: 'poison' | 'herb', enabled: boolean): Item[] => {
  const auth = useAuth();
  const notify = useTacticalNotify();
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    if (!enabled || items.length > 0) return;
    fetchItems(`category==${category}`, 0, 1000, auth)
      .then((page) => setItems(page.content))
      .catch(notify.error);
  }, [enabled]);
  return items;
};
