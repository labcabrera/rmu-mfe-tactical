import React from 'react';
import { useTranslation } from 'react-i18next';

import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';

import DefenseTextField from '../../input/DefenseTextField';
import EnduranceTextField from '../../input/EnduranceDefenseTextField';
import HeightTextField from '../../input/HeightTextField';
import HpTextField from '../../input/HpTextField';
import InitiativeTextField from '../../input/InitiativeTextField';
import MovementTextField from '../../input/MovementTextField';
import NameTextField from '../../input/NameTextField';
import PowerPointsTextField from '../../input/PowerPointsTextField';
import WeightTextField from '../../input/WeightTextField';
import SelectSize from '../../select/SelectCharacterSize';
import SelectFaction from '../../select/SelectFaction';
import SelectLevel from '../../select/SelectLevel';
import SelectRace from '../../select/SelectRace';

import { API_NPC_NAMES_URL } from '../../../constants/environment';
import { VARIANT } from '../../../constants/ui';

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

                <Grid item size={8}>
                    <SelectRace value={formData.info.race} onChange={onRaceChange} />
                </Grid>
                <Grid item size={4}></Grid>

                <Grid item size={8}>
                    <NameTextField value={formData.name} onChange={handleChange} generateRandom={true} generateRandomRaceValue={formData.info.race} />
                </Grid>
                <Grid item size={4}></Grid>

                <Grid item size={4}>
                    <SelectFaction factions={factions} value={formData.faction} onChange={onFactionChange} />
                </Grid>
                <Grid item size={4}>
                    <SelectLevel value={formData.info.level} onChange={onLevelChange} />
                </Grid>
                <Grid item size={4}>
                    <SelectSize value={formData.info.sizeId} onChange={onSizeChange} />
                </Grid>

                <Grid item size={4}>
                    <HeightTextField value={formData.info.height} onChange={handleHeightChange} />
                </Grid>
                <Grid item size={4}>
                    <WeightTextField value={formData.info.weight} onChange={handleWeightChange} />
                </Grid>
                <Grid item size={4}>
                </Grid>

                <Grid item size={4}>
                    <MovementTextField i18nLabel='stride-custom-bonus' value={formData.movement.strideCustomBonus} onChange={handleStrideBonusChange} />
                </Grid>
                <Grid item size={4}>
                    <MovementTextField i18nLabel='stride-racial-bonus' value={formData.movement.strideRacialBonus} disabled />
                </Grid>
                <Grid item size={4}>
                </Grid>


                <Grid item size={4}>
                    <HpTextField value={formData.hp.max} onChange={handleHpMaxChange} />
                </Grid>
                <Grid item size={4}>
                    <EnduranceTextField value={formData.endurance.max} onChange={handleEnduranceMaxChange} />
                </Grid>
                <Grid item size={4}>
                    <PowerPointsTextField value={formData.power.max} onChange={handlePowerMaxChange} />
                </Grid>

                <Grid item size={4}>
                    <DefenseTextField value={formData.defense.defensiveBonus} onChange={handleDefensiveBonusChange} />
                </Grid>
                <Grid item size={4}>
                    <InitiativeTextField value={formData.initiative.customBonus} onChange={handleInitiativeCustomBonusChange} />
                </Grid>
                <Grid item size={4}>
                </Grid>

                <Grid item size={12}>
                    <TextField label='Description' variant={VARIANT} name='description' value={formData.description} onChange={handleChange} fullWidth multiline maxRows={4} />
                </Grid>
            </Grid>
        </div>
    );
}

export default TacticalCharacterCreationAttributes;