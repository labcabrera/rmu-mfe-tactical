import { useAuth } from 'react-oidc-context';
import { fetchEnumerations, Skill } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useQuery } from '@tanstack/react-query';

/** Specialization of the skills whose value is a spell list: they come from another API and are not offered here. */
const SPELL_LIST_SPECIALIZATION = 'spell-list';

export type SpecializationCatalog = {
  /** Keys of the catalog, what a sheet and an action store. */
  keys: string[];
  /** Name of each key, for the ones without a translation. */
  names: Record<string, string>;
  /** Still reading it: until then the declaration waits. */
  loading: boolean;
  error: Error | null;
};

/** The specializations a skill can have, from the enumerations of its category (global and of the realm). */
export function useSpecializationCatalog(skill: Skill | null, realmId?: string | null): SpecializationCatalog {
  const auth = useAuth();
  const category = skill?.specialization;
  const enabled = !!category && category !== SPELL_LIST_SPECIALIZATION;
  const query = useQuery({
    queryKey: ['skill-catalog', 'specializations', category, realmId ?? null],
    queryFn: () =>
      fetchEnumerations(
        `category==${category}${realmId ? `;(realmId==${realmId},realmId==null)` : ''}`,
        0,
        200,
        auth
      ).then((data) => data.content),
    enabled,
    staleTime: Infinity,
  });
  const content = query.data ?? [];
  return {
    keys: content.map((each) => each.key),
    names: Object.fromEntries(content.map((each) => [each.key, each.name ?? each.key])),
    loading: enabled && query.isPending,
    error: query.error,
  };
}
