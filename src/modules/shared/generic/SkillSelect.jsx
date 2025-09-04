/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import { API_CORE_URL } from '../../../constants/environment';
import MenuItem from '@mui/material';

const SkillSelect = ({ onAddSkill }) => {
  const { t } = useTranslation();

  const [skillCategories, setSkillCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [skillsFiltered, setSkillsFiltered] = useState([]);

  const [skillCategory, setSkillCategory] = useState('');
  const [skill, setSkill] = useState('');

  const handleSkillCategoryChange = (event) => {
    setSkillCategory(event.target.value);
  };

  const handleSkillChange = (event) => {
    setSkill(event.target.value);
  };

  const loadSkillsByCategory = () => {
    const filtered = skills.filter((e) => e.categoryId == skillCategory);
    setSkillsFiltered(filtered);
  };

  const handleAddSkill = () => {
    setSkill('');
    onAddSkill(skill);
  };

  useEffect(() => {
    const fetchSkillCategories = async () => {
      const response = await fetch(`${API_CORE_URL}/skill-categories?size=500`);
      const data = await response.json();
      setSkillCategories(data.content);
    };
    const fetchSkills = async () => {
      const response = await fetch(`${API_CORE_URL}/skills?size=500`);
      const data = await response.json();
      setSkills(data.content);
    };
    fetchSkillCategories();
    fetchSkills();
  }, []);

  useEffect(() => {
    loadSkillsByCategory();
  }, [skillCategory]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={5}>
        <FormControl fullWidth>
          <InputLabel id="select-skill-category-label">Skill category</InputLabel>
          <Select
            labelId="select-skill-category-label"
            value={skillCategory}
            onChange={handleSkillCategoryChange}
            fullWidth
            variant="standard"
            label="Skill category"
          >
            {skillCategories.map((e) => (
              <MenuItem value={e.id}>{t(e.id)}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={5}>
        <FormControl fullWidth>
          <InputLabel id="select-skill-label">Skill</InputLabel>
          <Select labelId="select-skill-label" value={skill} onChange={handleSkillChange} fullWidth variant="standard" label="Skill category">
            {skillsFiltered.map((e) => (
              <MenuItem value={e.id}>{t(e.id)}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={2}>
        <IconButton aria-label="delete" size="small" disabled={!skill} onClick={handleAddSkill}>
          <AddCircleOutlineIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export default SkillSelect;
