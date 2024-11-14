import React from 'react';
import { useTranslation } from 'react-i18next';

import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';

import DefenseTextField from '../../input/DefenseTextField';
import EnduranceTextField from '../../input/EnduranceDefenseTextField';
import HeightTextField from '../../input/HeightTextField';
import HpTextField from '../../input/HpTextField';
import InitiativeTextField from '../../input/InitiativeTextField';
import WeightTextField from '../../input/WeightTextField';
import SelectArmorType from '../../select/SelectArmorType';
import SelectCharacterSize from '../../select/SelectCharacterSize';
import SelectFaction from '../../select/SelectFaction';
import SelectLevel from '../../select/SelectLevel';
import SelectRace from '../../select/SelectRace';

import { VARIANT } from '../../../constants/ui';
import ManaTextField from '../../input/ManaTextFields';

const CharacterModificationAttributes = ({ formData, setFormData, factions }) => {

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

    const handleStrideCustomBonusChange = (e) => {
        const strideCustomBonus = e.target.value ? parseInt(e.target.value) : 0;
        const strideRacialBonus = formData.movement.strideRacialBonus;
        const quBonus = formData.statistics.qu.totalBonus;
        const bmr = 20 + quBonus / 2 + strideCustomBonus + strideRacialBonus;
        setFormData((prevState) => ({
            ...prevState,
            movement: {
                baseMovementRate: bmr,
                strideRacialBonus: strideRacialBonus,
                strideCustomBonus: strideCustomBonus
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
                    <TextField label={t('name')} variant={VARIANT} fullWidth name="name" value={formData.name} onChange={handleChange} required />
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
                    <DefenseTextField value={formData.defense.defensiveBonus} onChange={handleDefensiveBonusChange} />
                </Grid>

                <Grid size={4}>
                    <SelectCharacterSize value={formData.info.sizeId} onChange={onSizeChange} />
                </Grid>
                <Grid size={4}>
                    <HeightTextField value={formData.info.height} onChange={handleHeightChange} />
                </Grid>
                <Grid size={4}>
                    <WeightTextField value={formData.info.weight} onChange={handleWeightChange} />
                </Grid>

                <Grid size={4}>
                    <TextField label="Base movement rate" variant={VARIANT} type="text" value={formData.movement.baseMovementRate} disabled fullWidth />
                </Grid>
                <Grid size={4}>
                    <TextField label="Stride racial bonus" variant={VARIANT} type="text" value={formData.movement.strideRacialBonus} disabled fullWidth />
                </Grid>
                <Grid size={4}>
                    <TextField label="Stride custom bonus" variant={VARIANT} type="text" value={formData.movement.strideCustomBonus} onChange={handleStrideCustomBonusChange} fullWidth />
                </Grid>

                <Grid size={4}>
                    <InitiativeTextField i18nLabel="iniativeBaseBonus" value={formData.initiative.baseBonus} disabled fullWidth />
                </Grid>
                <Grid size={4}>
                    <InitiativeTextField i18nLabel="initiativeCustomBonus" value={formData.initiative.customBonus} onChange={handleInitiativeCustomChange} />
                </Grid>
                <Grid size={4}>
                    <InitiativeTextField i18nLabel="initiativeTotalBonus" value={formData.initiative.totalBonus} disabled fullWidth />
                </Grid>

                <Grid size={4}>
                    <HpTextField i18nLabel="hit-points-max" value={formData.hp.max} onChange={handleHpMaxChange} />
                </Grid>
                <Grid size={4}>
                    <HpTextField i18nLabel="hit-points-current" value={formData.hp.current} onChange={handleHpCurrentChange} />
                </Grid>
                <Grid size={4}>
                </Grid>

                <Grid size={4}>
                    <EnduranceTextField i18nLabel="endurance-max" value={formData.endurance.max} onChange={handleEnduranceMaxChange} />
                </Grid>
                <Grid size={4}>
                    <EnduranceTextField i18nLabel="endurance-current" value={formData.endurance.current} onChange={handleEnduranceCurrentChange} />
                </Grid>
                <Grid size={4}>
                </Grid>

                <Grid size={4}>
                    <ManaTextField value={formData.power.max} onChange={handlePowerMaxChange} />
                </Grid>
                <Grid size={4}>
                    <ManaTextField value={formData.power.current} onChange={handlePowerCurrentChange} />
                </Grid>
                <Grid size={4}>
                </Grid>

                <Grid size={12}>
                    <TextField label="Description" variant={VARIANT} name="description" value={formData.description} onChange={handleChange} fullWidth multiline maxRows={4} />
                </Grid>
            </Grid>
        </div>
    );
}

export default CharacterModificationAttributes;