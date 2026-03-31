import React, { FC, useEffect, useState } from 'react';
import { Stack, Button, Grid, FormControl, Divider } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { fetchSkills } from '../../api/skill';
import { fetchSkillCategories } from '../../api/skill-category';
import { SkillCategory } from '../../api/skill-category.dto';
import { Skill } from '../../api/skill.dto';

const SelectSkillByCategory: FC<{
  value?: string;
  onChange: (skillId: string | null) => void;
  readOnly?: boolean;
}> = ({ value, onChange, readOnly = false }) => {
  const { showError } = useError();

  const [categories, setCategories] = useState<SkillCategory[] | undefined>(undefined);
  const [allSkills, setAllSkills] = useState<Skill[] | undefined>(undefined);
  const [skills, setSkills] = useState<Skill[] | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchSkillCategories()
      .then((data) => setCategories(data))
      .catch((err) => showError(err.message));
    fetchSkills()
      .then((data) => setAllSkills(data))
      .catch((err) => showError(err.message));
  }, [showError]);

  useEffect(() => {
    if (selectedCategory) {
      setSkills(allSkills?.filter((sk) => sk.categoryId === selectedCategory));
    } else {
      setSkills(undefined);
    }
  }, [selectedCategory]);

  const handleCategoryClick = (catId: string) => {
    if (readOnly) return;
    onChange(null);
    setSelectedCategory(catId);
  };

  const handleSkillClick = (skillId: string) => {
    if (readOnly) return;
    onChange(skillId);
  };

  if (!categories || !allSkills) return <div>Loading...</div>;

  return (
    <Grid container spacing={2} mt={2}>
      <Grid size={12}>
        <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
            {categories.map((cat) => {
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
        </FormControl>
      </Grid>
      <Grid size={12} mt={2}>
        <Divider sx={{ width: '100%', my: 1 }} />
      </Grid>
      <Grid size={12}>
        <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
            {skills?.map((sk) => {
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
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default SelectSkillByCategory;
