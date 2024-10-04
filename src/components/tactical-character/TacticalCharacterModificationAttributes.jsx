import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';

import SelectRace from '../select/SelectRace';
import SelectArmorType from '../select/SelectArmorType';
import SelectCharacterSize from '../select/SelectCharacterSize';
import SelectLevel from '../select/SelectLevel';
import SelectFaction from '../select/SelectFaction';

const TacticalCharacterModificationAttributes = ({ formData, setFormData, factions }) => {

    const variant = 'standard';

    const { t, i18n } = useTranslation();

    const handleChange = (e) => {
        try {
            const { name, value } = e.target;
            setFormData({ ...formData, [name]: value });
        } catch (error) {
            console.log("handleChange error " + error);
        }
    };

    const handleDefensiveBonusChange = (e) => updateFormData('defense', 'defensiveBonus', e.target.value ? parseInt(e.target.value) : 0);
    const handleHpMaxChange = (e) => updateFormData('hp', 'max', e.target.value ? parseInt(e.target.value) : 0);
    const handleHpCurrentChange = (e) => updateFormData('hp', 'current', e.target.value ? parseInt(e.target.value) : 0);
    const handleEnduranceMaxChange = (e) => updateFormData('endurance', 'max', e.target.value ? parseInt(e.target.value) : 0);
    const handleEnduranceCurrentChange = (e) => updateFormData('endurance', 'current', e.target.value ? parseInt(e.target.value) : 0);
    const handlePowerMaxChange = (e) => updateFormData('power', 'max', e.target.value ? parseInt(e.target.value) : 0);
    const handlePowerCurrentChange = (e) => updateFormData('power', 'current', e.target.value ? parseInt(e.target.value) : 0);
    const handleHeightChange = (e) => { updateFormData('info', 'height', e.target.value ? parseInt(e.target.value) : 0) };
    const handleWeightChange = (e) => { updateFormData('info', 'weight', e.target.value ? parseInt(e.target.value) : 0) };
    
    const handleStrideBonusChange = (e) => {
        const strideBonus = e.target.value ? parseInt(e.target.value) : 0;
        const quBonus = formData.statistics.qu.totalBonus;
        const bmr = 20 + quBonus/2 + strideBonus;
        setFormData((prevState) => ({
            ...prevState,
            movement: {
                baseMovementRate: bmr,
                strideBonus: strideBonus
            }
        }));
    };

    const handleInitiativeCustomChange = (e) => {
        const baseBonus = formData.initiative.baseBonus;
        const customBonus = e.target.value ? parseInt(e.target.value) : 0
        const totalBonus = baseBonus + customBonus;
        setFormData((prevState) => ({
            ...prevState,
            initiative: {
                baseBonus: baseBonus,
                customBonus: customBonus,
                totalBonus: totalBonus
            }
        }));
    };

    const onRaceChange = (raceId, raceInfo) => {
        if (raceInfo) {
            const stats = { ...formData.statistics };
            const keys = ['ag', 'co', 'em', 'in', 'me', 'pr', 'qu', 're', 'sd', 'st'];
            keys.forEach(key => {
                stats[key].racial = raceInfo.defaultStatBonus[key];
                const totalBonus = stats[key].custom + stats[key].racial + stats[key].custom;
                stats[key].totalBonus = totalBonus;
            });
            setFormData((prevState) => ({
                ...prevState,
                info: {
                    ...prevState.info,
                    race: raceId,
                    sizeId: raceInfo.size,
                    height: raceInfo.averageHeight.male,
                    weight: raceInfo.averageWeight.male,
                },
                movement: {
                    ...prevState.movement,
                    strideBonus: raceInfo.strideBonus,
                },
                statistics: stats
            }))
        }
    };

    const updateFormData = (field1, field2, value) => {
        setFormData((prevState) => ({
            ...prevState,
            [field1]: {
                ...prevState[field1],
                [field2]: value
            }
        }));
    };

    const onArmorTypeChange = (armorTypeId, armorType) => {
        updateFormData('defense', 'armorTypeId', armorTypeId);
    };

    const onSizeChange = (sizeId, sizeInfo) => {
        updateFormData('info', 'sizeId', sizeId);
    };

    const onLevelChange = (level) => {
        updateFormData('info', 'level', level);
    };

    const onFactionChange = (faction) => {
        setFormData({ ...formData, faction: faction });
    };


    if (!formData || !setFormData || !factions) {
        return <p>Loading...</p>
    }

    return (
        <div className="tactical-game-character-modification-attributes">
            <Grid container spacing={2}>

                <Grid size={4}>
                    <TextField label={t('name')} variant={variant} fullWidth name="name" value={formData.name} onChange={handleChange} required />
                </Grid>
                <Grid size={4}>
                    <SelectRace value={formData.info.race} onChange={onRaceChange} />
                </Grid>
                <Grid size={4}>
                    <SelectFaction factions={factions} value={formData.faction} onChange={onFactionChange} />
                </Grid>

                <Grid size={4}>
                    <SelectLevel value={formData.info.level} onChange={onLevelChange} />
                </Grid>
                <Grid size={4}>
                    <SelectArmorType value={formData.defense.armorType} onChange={onArmorTypeChange} />
                </Grid>
                <Grid size={4}>
                    <TextField label="Defensive bonus" variant={variant} type="text" value={formData.defense.defensiveBonus} onChange={handleDefensiveBonusChange} fullWidth />
                </Grid>

                <Grid size={4}>
                    <SelectCharacterSize value={formData.info.sizeId} onChange={onSizeChange} />
                </Grid>
                <Grid size={4}>
                    <TextField label="Height" variant={variant} type="text" value={formData.info.height} onChange={handleHeightChange} fullWidth />
                </Grid>
                <Grid size={4}>
                    <TextField label="Weight" variant={variant} type="text" value={formData.info.weight} onChange={handleWeightChange} fullWidth />
                </Grid>

                <Grid size={4}>
                    <TextField label="Base movement rate" variant={variant} type="text" value={formData.movement.baseMovementRate} disabled fullWidth />
                </Grid>
                <Grid size={4}>
                    <TextField label="Stride bonus" variant={variant} type="text" value={formData.movement.strideBonus} onChange={handleStrideBonusChange} fullWidth />
                </Grid>
                <Grid size={4}>
                </Grid>

                <Grid size={4}>
                    <TextField label="Initiative base" variant={variant} type="text" value={formData.initiative.baseBonus} disabled fullWidth />
                </Grid>
                <Grid size={4}>
                    <TextField label="Initiative custom" variant={variant} type="text" value={formData.initiative.customBonus} onChange={handleInitiativeCustomChange} fullWidth />
                </Grid>
                <Grid size={4}>
                    <TextField label="Initiative total" variant={variant} type="text" value={formData.initiative.totalBonus} disabled fullWidth />
                </Grid>

                <Grid size={4}>
                    <TextField label="Max HP" variant={variant} type="text" value={formData.hp.max} onChange={handleHpMaxChange} fullWidth />
                </Grid>
                <Grid size={4}>
                    <TextField label="Current HP" variant={variant} type="text" value={formData.hp.current} onChange={handleHpCurrentChange} fullWidth />
                </Grid>
                <Grid size={4}>
                </Grid>

                <Grid size={4}>
                    <TextField label="Max endurance" variant={variant} type="text" value={formData.endurance.max} onChange={handleEnduranceMaxChange} fullWidth />
                </Grid>
                <Grid size={4}>
                    <TextField label="Current endurance" variant={variant} type="text" value={formData.endurance.current} onChange={handleEnduranceCurrentChange} fullWidth />
                </Grid>
                <Grid size={4}>
                </Grid>

                <Grid size={4}>
                    <TextField label="Max HP" variant={variant} type="text" value={formData.power.max} onChange={handlePowerMaxChange} fullWidth />
                </Grid>
                <Grid size={4}>
                    <TextField label="Current HP" variant={variant} type="text" value={formData.power.current} onChange={handlePowerCurrentChange} fullWidth />
                </Grid>
                <Grid size={4}>
                </Grid>

                <Grid size={12}>
                    <TextField label="Description" variant={variant} name="description" value={formData.description} onChange={handleChange} fullWidth multiline maxRows={4} />
                </Grid>
            </Grid>
        </div>
    );
}

export default TacticalCharacterModificationAttributes;