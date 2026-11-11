import { useAuth } from 'react-oidc-context';
import { fetchSkillDifficulty, SkillDifficultyGuide } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useQuery } from '@tanstack/react-query';

/**
 * Example difficulties of a skill for the DifficultyPicker (spec 037). Rulebook data that never changes during a
 * session: one request per skill. Without Core Law access (403) or without imported guides the picker simply has no
 * guide, so errors are not notified.
 */
export const useSkillDifficultyGuide = (skillId: string | null | undefined): SkillDifficultyGuide | null => {
  const auth = useAuth();
  const { data } = useQuery({
    queryKey: ['skill-difficulty-guide', skillId],
    queryFn: () => fetchSkillDifficulty(skillId as string, auth).catch(() => null),
    enabled: !!skillId,
    staleTime: Infinity,
    gcTime: Infinity,
  });
  return skillId ? (data ?? null) : null;
};
