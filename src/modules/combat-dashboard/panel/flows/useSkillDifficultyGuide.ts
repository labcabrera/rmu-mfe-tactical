import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { fetchSkillDifficulty, SkillDifficultyGuide } from '@labcabrera-rmu/rmu-react-shared-lib';

// The guides are rulebook data that never change during a session: one request per skill.
const cache = new Map<string, Promise<SkillDifficultyGuide | null>>();

/**
 * Example difficulties of a skill for the DifficultyPicker (spec 037). Without Core Law access (403) or without
 * imported guides the picker simply has no guide, so errors are not notified.
 */
export const useSkillDifficultyGuide = (skillId: string | null | undefined): SkillDifficultyGuide | null => {
  const auth = useAuth();
  const [guide, setGuide] = useState<SkillDifficultyGuide | null>(null);

  useEffect(() => {
    if (!skillId) {
      setGuide(null);
      return;
    }
    let active = true;
    if (!cache.has(skillId))
      cache.set(
        skillId,
        fetchSkillDifficulty(skillId, auth).catch(() => null)
      );
    cache.get(skillId)!.then((value) => active && setGuide(value));
    return () => {
      active = false;
    };
  }, [skillId]);

  return guide;
};
