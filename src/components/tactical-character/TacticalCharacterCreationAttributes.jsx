import React, { useEffect, useState } from 'react';

import CachedIcon from '@mui/icons-material/Cached';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';

import { API_CORE_URL, API_NPC_NAMES_URL } from '../../constants/environment';

const TacticalCharacterCreationAttributes = ({ formData, setFormData, factions }) => {

    const variant = 'standard';

    const levels = Array.from({ length: 101 }, (_, index) => index);
    const [races, setRaces] = useState([]);
    const [characterSizes, setCharacterSizes] = useState([]);

    const handleChange = (e) => {
        try {
            const { name, value } = e.target;
            setFormData({ ...formData, [name]: value });
        } catch (error) {
            console.log("handleChange error " + error);
        }
    };

    const handleRandomNameClick = async (e) => {
        var race = 'generic';
        if (formData && formData.info && formData.info.race) {
            race = formData.info.race;
        }
        const response = await fetch(`${API_NPC_NAMES_URL}/random-names/${race}`);
        const responseBody = await response.text();
        setFormData({ ...formData, name: responseBody });
    };

    const handleFactionChange = (e) => setFormData({ ...formData, faction: e.target.value });
    const handleLevelChange = (e) => updateFormData('info', 'level', e.target.value);
    const handleRaceChange = (e) => updateFormData('info', 'race', e.target.value);
    const handleBaseMovementRateChange = (e) => updateFormData('info', 'baseMovementRate', e.target.value ? parseInt(e.target.value) : 0);
    const handleArmorTypeChange = (e) => updateFormData('defense', 'armorType', e.target.value);
    const handleDefensiveBonusChange = (e) => updateFormData('defense', 'defensiveBonus', e.target.value ? parseInt(e.target.value) : 0);
    const handleSizeChange = (e) => updateFormData('info', 'sizeId', e.target.value);
    const handleHpMaxChange = (e) => updateFormData('hp', 'max', e.target.value ? parseInt(e.target.value) : 0);
    const handleHpCurrentChange = (e) => updateFormData('hp', 'current', e.target.value ? parseInt(e.target.value) : 0);
    const handleEnduranceMaxChange = (e) => updateFormData('endurance', 'max', e.target.value ? parseInt(e.target.value) : 0);
    const handleEnduranceCurrentChange = (e) => updateFormData('endurance', 'current', e.target.value ? parseInt(e.target.value) : 0);
    const handlePowerMaxChange = (e) => updateFormData('power', 'max', e.target.value ? parseInt(e.target.value) : 0);
    const handlePowerCurrentChange = (e) => updateFormData('power', 'current', e.target.value ? parseInt(e.target.value) : 0);
    const handleInitiativeChange = (e) => updateFormData('initiative', 'base', e.target.value ? parseInt(e.target.value) : 0);
    const handleHeightChange = (e) => updateFormData('info', 'height', e.target.value ? parseInt(e.target.value) : 0);
    const handleWeightChange = (e) => updateFormData('info', 'weight', e.target.value ? parseInt(e.target.value) : 0);

    const updateFormData = (field1, field2, value) => {
        setFormData((prevState) => ({
            ...prevState,
            [field1]: {
                ...prevState[field1],
                [field2]: value
            }
        }));
    };

    useEffect(() => {
        const fetchRaces = async () => {
            const response = await fetch(`${API_CORE_URL}/races`);
            const data = await response.json();
            setRaces(data.content);
        };
        const fetchCharacterSizes = async () => {
            const response = await fetch(`${API_CORE_URL}/character-sizes`);
            const data = await response.json();
            setCharacterSizes(data.map((item) => { return { id: item.id, name: item.name } }));
        };
        fetchRaces();
        fetchCharacterSizes();
    }, []);

    return (
        <div className="tactical-game-character-creation-attributes">
            <Grid container spacing={2}>

                <Grid size={3}>
                    <FormControl fullWidth>
                        <InputLabel id="select-race-label">Race</InputLabel>
                        <Select id="select-race" labelId="select-race-label" label="Race" value={formData.info.race} variant={variant} required onChange={handleRaceChange}>
                            {races.map((option, index) => (<MenuItem key={index} value={option.id}>{option.name}</MenuItem>))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={3}>
                    <TextField label="Name" variant={variant} fullWidth name="name" value={formData.name} onChange={handleChange} required />
                </Grid>
                <Grid size={6}>
                    <IconButton onClick={handleRandomNameClick}>
                        <CachedIcon />
                    </IconButton>
                </Grid>

                <Grid size={3}>
                    <FormControl fullWidth>
                        <InputLabel id="select-faction-label">Faction</InputLabel>
                        <Select id="select-faction" labelId="select-faction-label" label="Faction" value={formData.faction} variant={variant} required onChange={handleFactionChange}>
                            {factions.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={3}>
                    <FormControl fullWidth>
                        <InputLabel id="select-level-label">Level</InputLabel>
                        <Select
                            id="select-level"
                            labelId="select-level-label"
                            label="Level"
                            value={formData.info.level}
                            required
                            variant={variant}
                            onChange={handleLevelChange}>
                            {levels.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={6}></Grid>

                <Grid size={3}>
                    <FormControl fullWidth>
                        <InputLabel id="select-size-label">Size</InputLabel>
                        <Select
                            id="select-size"
                            labelId="select-size-label"
                            label="Size"
                            value={formData.info.sizeId}
                            required
                            fullWidth
                            variant={variant}
                            onChange={handleSizeChange}>
                            {characterSizes.map((option) => (<MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={3}>
                    <TextField label="Defensive bonus" variant={variant} type="text" value={formData.defense.defensiveBonus} onChange={handleDefensiveBonusChange} fullWidth />
                </Grid>
                <Grid size={6}></Grid>


                <Grid size={3}>
                    <TextField label="Height" variant={variant} type="text" value={formData.info.height} onChange={handleHeightChange} fullWidth />
                </Grid>
                <Grid size={3}>
                    <TextField label="Weight" variant={variant} type="text" value={formData.info.weight} onChange={handleWeightChange} fullWidth />
                </Grid>
                <Grid size={3}>
                    <TextField label="Base movement rate" variant={variant} type="text" value={formData.info.baseMovementRate} onChange={handleBaseMovementRateChange} fullWidth />
                </Grid>
                <Grid size={3}></Grid>

                <Grid size={3}>
                    <TextField label="HP" variant={variant} type="text" value={formData.hp.max} onChange={handleHpMaxChange} fullWidth />
                </Grid>
                <Grid size={3}>
                    <TextField label="Endurance" variant={variant} type="text" value={formData.endurance.max} onChange={handleEnduranceMaxChange} fullWidth />
                </Grid>
                <Grid size={3}>
                    <TextField label="Power points" variant={variant} type="text" value={formData.power.max} onChange={handlePowerMaxChange} fullWidth />
                </Grid>
                <Grid size={3}>
                </Grid>

                <Grid size={3}>
                    <TextField label="Initiative bonus" variant={variant} type="text" value={formData.initiative.base} onChange={handleInitiativeChange} fullWidth />
                </Grid>
                <Grid size={9}></Grid>

                <Grid size={9}>
                    <TextField label="Description" variant={variant} name="description" value={formData.description} onChange={handleChange} fullWidth multiline maxRows={4} />
                </Grid>
            </Grid>
        </div>
    );
}

export default TacticalCharacterCreationAttributes;