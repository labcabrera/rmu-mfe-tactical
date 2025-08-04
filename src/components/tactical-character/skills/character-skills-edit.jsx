import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { API_CORE_URL, API_TACTICAL_URL } from "../../../constants/environment";

function capitalize(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

const SkillCard = ({ 
    skill, 
    skills, 
    isEditing, 
    isNew, 
    onEdit, 
    onSave, 
    onCancel, 
    onDelete, 
    onChange, 
    t 
}) => {
    return (
        <Card sx={{ mb: 2, border: isEditing ? '2px solid #1976d2' : '1px solid #e0e0e0' }}>
            <CardContent>
                <Grid container spacing={2} alignItems="center">
                    {/* Skill Selection/Display */}
                    <Grid item size={2}>
                        {isNew && isEditing ? (
                            <FormControl fullWidth>
                                <InputLabel>Skill</InputLabel>
                                <Select
                                    value={skill.skillId || ''}
                                    label="Skill"
                                    onChange={(e) => onChange('skillId', e.target.value)}
                                >
                                    {skills.map((option) => (
                                        <MenuItem key={option.id} value={option.id}>
                                            {t(option.id)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        ) : (
                            <Typography variant="h6">{t(skill.skillId)}</Typography>
                        )}
                    </Grid>

                    {/* Statistics Display */}
                    <Grid item size={1}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Statistics
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            {skill.statistics?.map((stat, index) => (
                                <Chip 
                                    key={index} 
                                    label={capitalize(stat)} 
                                    variant="outlined" 
                                    size="small"
                                />
                            ))}
                        </Stack>
                    </Grid>

                    {/* Specialization */}
                    <Grid item size={1}>
                        {isEditing ? (
                            <TextField
                                fullWidth
                                label="Specialization"
                                value={skill.specialization || ''}
                                onChange={(e) => onChange('specialization', e.target.value)}
                                size="small"
                            />
                        ) : (
                            <div>
                                <Typography variant="body2" color="textSecondary">
                                    Specialization
                                </Typography>
                                <Typography variant="body1">
                                    {skill.specialization || '-'}
                                </Typography>
                            </div>
                        )}
                    </Grid>

                    {/* Ranks */}
                    <Grid item size={1}>
                        {isEditing ? (
                            <TextField
                                fullWidth
                                label="Ranks"
                                type="number"
                                value={skill.ranks || 0}
                                onChange={(e) => onChange('ranks', parseInt(e.target.value) || 0)}
                                size="small"
                                inputProps={{ min: 0 }}
                            />
                        ) : (
                            <div>
                                <Typography variant="body2" color="textSecondary">
                                    Ranks
                                </Typography>
                                <Typography variant="body1">{skill.ranks}</Typography>
                            </div>
                        )}
                    </Grid>

                    {/* Custom Bonus */}
                    <Grid item size={1}>
                        {isEditing ? (
                            <TextField
                                fullWidth
                                label="Custom"
                                type="number"
                                value={skill.customBonus || 0}
                                onChange={(e) => onChange('customBonus', parseInt(e.target.value) || 0)}
                                size="small"
                            />
                        ) : (
                            <div>
                                <Typography variant="body2" color="textSecondary">
                                    Custom
                                </Typography>
                                <Typography variant="body1">{skill.customBonus}</Typography>
                            </div>
                        )}
                    </Grid>

                    {/* Total Bonus */}
                    <Grid item size={1}>
                        <div>
                            <Typography variant="body2" color="textSecondary">
                                Total
                            </Typography>
                            <Typography variant="h6" color="primary">
                                {skill.totalBonus}
                            </Typography>
                        </div>
                    </Grid>
                </Grid>

                {/* Bonus Details Row */}
                {!isEditing && (
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={3}>
                            <Typography variant="caption" color="textSecondary">
                                Dev: {skill.developmentBonus}
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography variant="caption" color="textSecondary">
                                Stats: {skill.statBonus}
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography variant="caption" color="textSecondary">
                                Racial: {skill.racialBonus}
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography variant="caption" color="textSecondary">
                                Custom: {skill.customBonus}
                            </Typography>
                        </Grid>
                    </Grid>
                )}
            </CardContent>

            <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                {isEditing ? (
                    <>
                        <IconButton 
                            onClick={onSave} 
                            color="primary" 
                            title="Save"
                        >
                            <SaveIcon />
                        </IconButton>
                        <IconButton 
                            onClick={onCancel} 
                            color="secondary" 
                            title="Cancel"
                        >
                            <CancelIcon />
                        </IconButton>
                    </>
                ) : (
                    <>
                        <IconButton 
                            onClick={onEdit} 
                            color="primary" 
                            title="Edit"
                        >
                            <EditIcon />
                        </IconButton>
                        <IconButton 
                            onClick={onDelete} 
                            color="error" 
                            title="Delete"
                        >
                            <DeleteIcon />
                        </IconButton>
                    </>
                )}
            </CardActions>
        </Card>
    );
};

const CharacterSkillsEdit = ({ tacticalCharacter, setTacticalCharacter }) => {
    const { t } = useTranslation();

    const [skills, setSkills] = useState([]);
    const [skillCategories, setSkillCategories] = useState([]);
    const [characterSkills, setCharacterSkills] = useState(tacticalCharacter.skills || []);
    const [editingSkillId, setEditingSkillId] = useState(null);
    const [newSkill, setNewSkill] = useState(null);

    // Fetch skills and categories on component mount
    useEffect(() => {
        const fetchSkillCategories = async () => {
            try {
                const response = await fetch(`${API_CORE_URL}/skill-categories?size=500`);
                const data = await response.json();
                setSkillCategories(data.content);
            } catch (error) {
                console.error('Error fetching skill categories:', error);
            }
        };

        const fetchSkills = async () => {
            try {
                const response = await fetch(`${API_CORE_URL}/skills?size=500`);
                const responseBody = await response.json();
                const translated = responseBody.content.map(e => ({
                    ...e,
                    name: t(e.id)
                }));
                const sorted = translated.sort((a, b) => a.id.localeCompare(b.id));
                setSkills(sorted);
            } catch (error) {
                console.error('Error fetching skills:', error);
            }
        };

        fetchSkillCategories();
        fetchSkills();
    }, [t]);

    // Update character skills when tacticalCharacter changes
    useEffect(() => {
        setCharacterSkills(tacticalCharacter.skills || []);
    }, [tacticalCharacter.skills]);

    const handleAddNew = () => {
        const newSkillData = {
            skillId: '',
            specialization: '',
            statistics: [],
            ranks: 0,
            statBonus: '',
            racialBonus: '',
            developmentBonus: '',
            customBonus: 0,
            totalBonus: '',
            newId: `new-${Date.now()}`
        };
        setNewSkill(newSkillData);
    };

    const handleEdit = (skillId) => {
        setEditingSkillId(skillId);
    };

    const handleCancel = () => {
        setEditingSkillId(null);
        setNewSkill(null);
    };

    const handleSave = async (skill) => {
        try {
            if (skill.newId) {
                // Create new skill
                const request = {
                    skillId: skill.skillId,
                    specialization: skill.specialization,
                    ranks: skill.ranks,
                    customBonus: skill.customBonus
                };

                const response = await fetch(
                    `${API_TACTICAL_URL}/characters/${tacticalCharacter.id}/skills`, 
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(request)
                    }
                );

                if (response.ok) {
                    const responseBody = await response.json();
                    setTacticalCharacter(responseBody);
                    setCharacterSkills(responseBody.skills);
                    setNewSkill(null);
                } else {
                    console.error('Error creating skill:', response.status);
                }
            } else {
                // Update existing skill
                const request = {
                    ranks: parseInt(skill.ranks),
                    customBonus: parseInt(skill.customBonus),
                    specialization: skill.specialization
                };

                const response = await fetch(
                    `${API_TACTICAL_URL}/characters/${tacticalCharacter.id}/skills/${skill.skillId}`, 
                    {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(request)
                    }
                );

                if (response.ok) {
                    const responseBody = await response.json();
                    setTacticalCharacter(responseBody);
                    setCharacterSkills(responseBody.skills);
                    setEditingSkillId(null);
                } else {
                    console.error('Error updating skill:', response.status);
                }
            }
        } catch (error) {
            console.error('Error saving skill:', error);
        }
    };

    const handleDelete = async (skillId) => {
        if (window.confirm(t('Are you sure you want to delete this skill?'))) {
            try {
                const response = await fetch(
                    `${API_TACTICAL_URL}/characters/${tacticalCharacter.id}/skills/${skillId}`, 
                    { method: 'DELETE' }
                );

                if (response.ok) {
                    const responseBody = await response.json();
                    setTacticalCharacter(responseBody);
                    setCharacterSkills(responseBody.skills);
                } else {
                    console.error('Error deleting skill:', response.status);
                }
            } catch (error) {
                console.error('Error deleting skill:', error);
            }
        }
    };

    const handleSkillChange = (skillId, field, value) => {
        if (newSkill && newSkill.newId === skillId) {
            setNewSkill({ ...newSkill, [field]: value });
        } else {
            setCharacterSkills(prev => 
                prev.map(skill => 
                    skill.skillId === skillId 
                        ? { ...skill, [field]: value }
                        : skill
                )
            );
        }
    };

    const getAvailableSkills = () => {
        const usedSkillIds = characterSkills.map(skill => skill.skillId);
        return skills.filter(skill => !usedSkillIds.includes(skill.id));
    };

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">Character Skills</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddNew}
                    disabled={newSkill !== null}
                >
                    Add Skill
                </Button>
            </Box>

            {/* New skill form */}
            {newSkill && (
                <SkillCard
                    skill={newSkill}
                    skills={getAvailableSkills()}
                    isEditing={true}
                    isNew={true}
                    onSave={() => handleSave(newSkill)}
                    onCancel={handleCancel}
                    onChange={(field, value) => handleSkillChange(newSkill.newId, field, value)}
                    t={t}
                />
            )}

            {/* Existing skills */}
            {characterSkills.map((skill) => (
                <SkillCard
                    key={skill.skillId}
                    skill={skill}
                    skills={skills}
                    isEditing={editingSkillId === skill.skillId}
                    isNew={false}
                    onEdit={() => handleEdit(skill.skillId)}
                    onSave={() => handleSave(skill)}
                    onCancel={handleCancel}
                    onDelete={() => handleDelete(skill.skillId)}
                    onChange={(field, value) => handleSkillChange(skill.skillId, field, value)}
                    t={t}
                />
            ))}

            {characterSkills.length === 0 && !newSkill && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="textSecondary">
                        No skills added yet
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Click "Add Skill" to get started
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default CharacterSkillsEdit;
