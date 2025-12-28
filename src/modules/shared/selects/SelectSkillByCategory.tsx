import React, { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Button, Typography } from '@mui/material';
import { fetchSkills } from '../../api/skill';
import { fetchSkillCategories } from '../../api/skill-category';
import { SkillCategory } from '../../api/skill-category.dto';
import { Skill } from '../../api/skill.dto';

const SelectSkillByCategory: FC<{
  value?: string;
  onChange: (skillId: string | null) => void;
  readOnly?: boolean;
  categories?: SkillCategory[];
  skills?: Skill[];
}> = ({ value, onChange, readOnly = false, categories, skills }) => {
  const { t } = useTranslation();
  const [catsState, setCatsState] = useState<SkillCategory[] | null>(
    categories && categories.length > 0 ? categories : null
  );
  const [skillsState, setSkillsState] = useState<Skill[] | null>(skills && skills.length > 0 ? skills : null);

  const cats = catsState ?? categories ?? [];
  const allSkills = skillsState ?? skills ?? [];

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // set initial selected category when categories are available or value changes
  useEffect(() => {
    if (cats && cats.length > 0) {
      if (value) {
        const s = allSkills.find((sk) => sk.id === value);
        setSelectedCategory(s ? s.categoryId : cats[0].id);
      } else {
        setSelectedCategory((prev) => prev ?? cats[0].id);
      }
    }
  }, [cats, allSkills, value]);

  const skillsForCategory = useMemo(
    () => allSkills.filter((s) => s.categoryId === selectedCategory),
    [allSkills, selectedCategory]
  );

  // fetch categories if not provided
  useEffect(() => {
    if (categories && categories.length > 0) return;
    let mounted = true;
    fetchSkillCategories()
      .then((data) => {
        if (!mounted) return;
        setCatsState(data);
      })
      .catch(() => {
        /* ignore errors silently for now */
      });
    return () => {
      mounted = false;
    };
  }, [categories]);

  // fetch skills for selected category if not provided
  useEffect(() => {
    if (!selectedCategory) return;
    if (skills && skills.length > 0) return;
    let mounted = true;
    fetchSkills(selectedCategory)
      .then((data) => {
        if (!mounted) return;
        setSkillsState(data);
      })
      .catch(() => {
        /* ignore errors silently for now */
      });
    return () => {
      mounted = false;
    };
  }, [selectedCategory, skills]);

  const handleCategoryClick = (catId: string) => {
    if (readOnly) return;
    // notify parent that selected skill is cleared when changing category
    onChange(null);
    setSelectedCategory(catId);
  };

  const handleSkillClick = (skillId: string) => {
    if (readOnly) return;
    onChange(skillId);
  };

  return (
    <div>
      <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
        {t('category')}
      </Typography>
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
        {cats.map((cat) => {
          const selected = cat.id === selectedCategory;
          return (
            <Button
              key={cat.id}
              size="small"
              variant={selected ? 'contained' : 'outlined'}
              color={selected ? 'primary' : 'inherit'}
              onClick={() => handleCategoryClick(cat.id)}
              disabled={readOnly}
            >
              {t(cat.id)}
            </Button>
          );
        })}
      </Stack>

      <Typography variant="caption" sx={{ display: 'block', mb: 0.5, mt: 1 }}>
        {t('skill')}
      </Typography>
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
        {skillsForCategory.map((sk) => {
          const selected = sk.id === value;
          return (
            <Button
              key={sk.id}
              size="small"
              variant={selected ? 'contained' : 'outlined'}
              color={selected ? 'primary' : 'inherit'}
              onClick={() => handleSkillClick(sk.id)}
              disabled={readOnly}
            >
              {t(sk.id)}
            </Button>
          );
        })}
      </Stack>
    </div>
  );
};

export default SelectSkillByCategory;
