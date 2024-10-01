import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';

import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { API_CORE_URL } from "../../constants/environment";

const SkillSelect = ({ }) => {

    const { t, i18n } = useTranslation();

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
        const filtered = skills.filter(e => e.categoryId == skillCategory);
        setSkillsFiltered(filtered);
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
            <Grid size={12}>
                <FormControl fullWidth>
                    <InputLabel id="select-skill-category-label">Skill category</InputLabel>
                    <Select
                        labelId="select-skill-category-label"
                        value={skillCategory}
                        onChange={handleSkillCategoryChange}
                        fullWidth
                        label="Skill category">
                        {skillCategories.map(e => (
                            <MenuItem value={e.id}>{t(e.id)}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid size={12}>
                <FormControl fullWidth>
                    <InputLabel id="select-skill-label">Skill</InputLabel>
                    <Select
                        labelId="select-skill-label"
                        value={skill}
                        onChange={handleSkillChange}
                        fullWidth
                        label="Skill category">
                        {skillsFiltered.map(e => (
                            <MenuItem value={e.id}>{t(e.id)}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
        </Grid>

    );
}

export default SkillSelect;