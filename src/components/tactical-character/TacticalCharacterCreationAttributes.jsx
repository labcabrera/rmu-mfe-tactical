import React from 'react';
import { useTranslation } from 'react-i18next';

import CachedIcon from '@mui/icons-material/Cached';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';

import SelectSize from '../../components/select/SelectCharacterSize';
import SelectFaction from '../../components/select/SelectFaction';
import SelectLevel from '../../components/select/SelectLevel';
import SelectRace from '../../components/select/SelectRace';

import NameTextField from '../input/NameTextField';

import { API_NPC_NAMES_URL } from '../../constants/environment';
import { VARIANT, VARIANT_DISABLED, SIZE } from '../../constants/ui';
import { Avatar } from '@mui/material';

const TacticalCharacterCreationAttributes = ({ formData, setFormData, factions }) => {

    const { t, i18n } = useTranslation();

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
                    strideRacialBonus: raceInfo.strideBonus,
                },
                statistics: stats
            }))
        }
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

    const handleChange = (e) => {
        try {
            const { name, value } = e.target;
            setFormData({ ...formData, [name]: value });
        } catch (error) {
            console.log('handleChange error ' + error);
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

    const handleInitiativeCustomBonusChange = (e) => updateFormData('initiative', 'customBonus', e.target.value ? parseInt(e.target.value) : 0);
    const handleDefensiveBonusChange = (e) => updateFormData('defense', 'defensiveBonus', e.target.value ? parseInt(e.target.value) : 0);
    const handleHpMaxChange = (e) => updateFormData('hp', 'max', e.target.value ? parseInt(e.target.value) : 0);
    const handleEnduranceMaxChange = (e) => updateFormData('endurance', 'max', e.target.value ? parseInt(e.target.value) : 0);
    const handlePowerMaxChange = (e) => updateFormData('power', 'max', e.target.value ? parseInt(e.target.value) : 0);
    const handleStrideBonusChange = (e) => updateFormData('movement', 'strideBonus', e.target.value ? parseInt(e.target.value) : 0);
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

    return (
        <div className='tactical-game-character-creation-attributes'>
            <Grid container spacing={2}>

                <Grid size={4}>
                    <SelectRace value={formData.info.race} onChange={onRaceChange} />
                </Grid>
                <Grid size={4}>
                    <NameTextField value={formData.name} onChange={handleChange} />
                    
                    {/* <TextField label={t('name')} variant={VARIANT} fullWidth name='name' value={formData.name} onChange={handleChange} required /> */}
                </Grid>
                <Grid size={4}>
                    <IconButton onClick={handleRandomNameClick}>
                        <CachedIcon />
                    </IconButton>
                </Grid>

                <Grid size={4}>
                    <SelectFaction factions={factions} value={formData.faction} onChange={onFactionChange} />
                </Grid>
                <Grid size={4}>
                    <SelectLevel value={formData.info.level} onChange={onLevelChange} />
                </Grid>
                <Grid size={4}>
                    <SelectSize value={formData.info.sizeId} onChange={onSizeChange} />
                </Grid>

                <Grid size={4}>
                    <TextField label='Height' variant={VARIANT} type='text' value={formData.info.height} onChange={handleHeightChange} fullWidth />
                </Grid>
                <Grid size={4}>
                    <TextField label='Weight' variant={VARIANT} type='text' value={formData.info.weight} onChange={handleWeightChange} fullWidth />
                </Grid>
                <Grid size={4}>
                </Grid>

                <Grid size={4}>
                    <TextField label='Stride custom bonus' variant={VARIANT} type='text' value={formData.movement.strideCustomBonus} onChange={handleStrideBonusChange} fullWidth />
                </Grid>
                <Grid size={4}>
                    <TextField label='Stride racial bonus' variant={VARIANT} type='text' value={formData.movement.strideRacialBonus} disabled fullWidth />
                </Grid>
                <Grid size={4}>
                </Grid>


                <Grid size={4}>
                    <TextField label='HP' variant={VARIANT} type='text' value={formData.hp.max} onChange={handleHpMaxChange} fullWidth />
                </Grid>
                <Grid size={4}>
                    <TextField label='Endurance' variant={VARIANT} type='text' value={formData.endurance.max} onChange={handleEnduranceMaxChange} fullWidth />
                </Grid>
                <Grid size={4}>
                    <TextField label='Power points' variant={VARIANT} type='text' value={formData.power.max} onChange={handlePowerMaxChange} fullWidth />
                </Grid>

                <Grid size={4}>
                    <TextField label='Defensive bonus' variant={VARIANT} type='text' value={formData.defense.defensiveBonus} onChange={handleDefensiveBonusChange} fullWidth />
                </Grid>
                <Grid size={4}>
                    <TextField label='Initiative bonus' variant={VARIANT} type='text' value={formData.initiative.customBonus} onChange={handleInitiativeCustomBonusChange} fullWidth />
                </Grid>
                <Grid size={4}>
                </Grid>

                <Grid size={12}>
                    <TextField label='Description' variant={VARIANT} name='description' value={formData.description} onChange={handleChange} fullWidth multiline maxRows={4} />
                </Grid>
            </Grid>
        </div>
    );
}

export default TacticalCharacterCreationAttributes;