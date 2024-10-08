import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';

import ActionPointSelector from '../shared/ActionPointSelector';
import TacticalActionCreationActions from '../combat/TacticalActionCreationActions';

import AttackTextField from '../input/AttackTextField';

import { API_CORE_URL, API_TACTICAL_URL } from "../../constants/environment";

const TacticalAttackCreation = () => {

    const debugMode = true;
    const variant = 'standard'

    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { t, i18n } = useTranslation();

    const phaseStart = searchParams.get('phaseStart');
    const tacticalGame = location.state?.tacticalGame;
    const character = location.state?.character;
    const characters = location.state?.characters;

    const restrictedQuartersOptions = [
        { id: 'none', bonus: 0 },
        { id: 'close', bonus: -25 },
        { id: 'cramped', bonus: -50 },
        { id: 'tigth', bonus: -75 },
        { id: 'confined', bonus: -100 }];

    const positionalMeleeOptions = [
        { id: 'none', bonus: 0 },
        { id: 'flank-attack', bonus: 15 },
        { id: 'read-attack', bonus: 35 },
        { id: 'to-flank', bonus: 30 },
        { id: 'to-rear', bonus: 70 }];

    const coverMeleeOptions = [
        { id: 'none', bonus: 0 },
        { id: 'partial', bonus: 10 },
        { id: 'half', bonus: 20 },
        { id: 'full', bonus: 50 }];

    //TODO READ FROM EQUIPEMENT
    const availableWeapons = [
        "main-hand",
        "off-hand"
    ];

    const [formData, setFormData] = useState({
        tacticalGameId: tacticalGame.id,
        round: tacticalGame.round,
        tacticalCharacterId: character.id,
        type: 'attack',
        phaseStart: phaseStart,
        actionPoints: 2,
        tacticalCharacterTargetId: '',
        attackInfo: {
            selectedWeapon: 'main-hand',
            armorType: 0,
            offensiveBonus: 0,
            defensiveBonus: 0,
            attackerParry: 0,
            defenderParry: 0,
            basePenalties: 0,
            pacePenalty: 0,
            attackerSizeId: character.info.sizeId,
            defenderSizeId: '',
            sizeHpMultiplier: '',
            sizeCriticalTypeModifier: '',
            restrictedQuarters: 'none'
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        };
        const createActionResponse = await fetch(`${API_TACTICAL_URL}/actions`, requestOptions);
        if (createActionResponse.status == 201) {
            navigate(`/tactical/combat/${tacticalGame.id}`);
        } else {
            error = await createActionResponse.json();
            console.log(error.message);
        }
    }

    const fetchCharacterSizeAttackEffects = async (attackerSizeId, defenderSizeId) => {
        try {
            const response = await fetch(`${API_CORE_URL}/character-sizes/attack-effects/${attackerSizeId}/${defenderSizeId}`);
            if (response.status == 200) {
                const data = await response.json();
                updateFormData('attackInfo', 'sizeHpMultiplier', data.hitMultiplier);
                updateFormData('attackInfo', 'sizeCriticalTypeModifier', data.criticalTypeModifier);
            }
        }
        catch (error) {
            console.error("fetchCharacterSizeAttackEffects error: " + error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value })
    }

    const handleTargetChange = async (e) => {
        const targetCharacterId = e.target.value;
        const targetCharacter = characters.find(e => e.id == targetCharacterId);
        console.log("target: " + JSON.stringify(targetCharacter, null, 2));
        setFormData({ ...formData, tacticalCharacterTargetId: targetCharacterId });
        updateFormData('attackInfo', 'armorType', targetCharacter.defense.armorType);
        updateFormData('attackInfo', 'defenderSizeId', targetCharacter.info.sizeId);
        await fetchCharacterSizeAttackEffects(formData.attackInfo.attackerSizeId, targetCharacter.info.sizeId);
    };

    const handleActionPointsChange = (actionPoints) => {
        //const actionPoints = Math.max(minActionPoints, parseInt(e.target.value));
        setFormData({ ...formData, actionPoints: actionPoints });
    };

    const handleSelectedWeaponChange = (e) => { updateFormData('attackInfo', 'selectedWeapon', e.target.value) };

    const handleRestrictedQuarterChange = (e) => { updateFormData('attackInfo', 'restrictedQuarters', e.target.value) };

    const updateFormData = (field1, field2, value) => {
        setFormData((prevState) => ({
            ...prevState,
            [field1]: {
                ...prevState[field1],
                [field2]: value
            }
        }));
    };

    if (!tacticalGame || !character || !characters) {
        return <p>Loading...</p>
    }

    return (
        <>
            <TacticalActionCreationActions tacticalGame={tacticalGame} formData={formData} />
            <div className="tactical-game-creation">

                <h2>Declare attack</h2>

                <Grid container spacing={1}>

                    <Grid size={2}>
                        <AttackTextField value={character.name} i18LabelKey='attacker' disabled />
                    </Grid>
                    <Grid size={2}>
                        <FormControl fullWidth>
                            <InputLabel id="select-target-label">Defender</InputLabel>
                            <Select
                                id="select-target"
                                labelId="select-target-label"
                                label="Defender"
                                value={formData.tacticalCharacterTargetId}
                                required
                                variant={variant}
                                onChange={handleTargetChange}>
                                {characters.filter(e => e.id != character.id).map((c, index) => (
                                    <MenuItem key={index} value={c.id}>{c.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid size={2}>
                        <ActionPointSelector value={formData.actionsPoints} min={2} max={4} defaultValue={2} onChange={handleActionPointsChange} />
                    </Grid>
                    <Grid size={6}></Grid>

                    <Grid size={2}>
                        <FormControl fullWidth>
                            <InputLabel id="select-weapon-label">Weapon</InputLabel>
                            <Select
                                id="select-weapon"
                                labelId="select-weapon-label"
                                label="Weapon"
                                value={formData.attackInfo.selectedWeapon}
                                required
                                variant={variant}
                                onChange={handleSelectedWeaponChange}>
                                {availableWeapons.map((c, index) => (
                                    <MenuItem key={index} value={c}>{c}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={2}>
                        <TextField label="Armor type" variant={variant} fullWidth name="armor-type" disabled value={formData.attackInfo.armorType} />
                    </Grid>
                    <Grid size={8}></Grid>

                    <Grid size={2}>
                        <TextField label="Offensive bonus" variant={variant} fullWidth name="offensive-bonus" disabled value={formData.attackInfo.offensiveBonus} />
                    </Grid>
                    <Grid size={2}>
                        <TextField
                            label="Defensive bonus" variant={variant} name="defensive-bonus" disabled value={formData.attackInfo.defensiveBonus} fullWidth />
                    </Grid>
                    <Grid size={8}>
                    </Grid>

                    <Grid size={2}>
                        <TextField label="Attacker size" variant={variant} name="attacker-size" fullWidth disabled
                            value={t(`size-${formData.attackInfo.attackerSizeId}`)} />
                    </Grid>
                    <Grid size={2}>
                        <TextField label="Defender size" variant={variant} name="defender-size" fullWidth disabled
                            value={formData.attackInfo.defenderSizeId ? t(`size-${formData.attackInfo.defenderSizeId}`) : ''} />
                    </Grid>
                    <Grid size={2}>
                        <TextField label="Size effect attacker HP multiplier" variant={variant} name="attacker-size-multiplier" fullWidth disabled
                            value={formData.attackInfo.sizeHpMultiplier} />
                    </Grid>
                    <Grid size={2}>
                        <TextField label="Size effect critical type modifier" variant={variant} name="attacker-size-multiplier" fullWidth disabled
                            value={formData.attackInfo.sizeCriticalTypeModifier} />
                    </Grid>
                    <Grid size={4}>
                    </Grid>

                    <Grid size={2}>
                        <TextField label="Attacker parry" variant={variant} fullWidth name="offensive-bonus" value={formData.attackInfo.offensiveBonus} />
                    </Grid>
                    <Grid size={2}>
                        <TextField label="Defender parry" variant={variant} name="defensive-bonus" value={formData.attackInfo.defensiveBonus} onChange={handleChange} fullWidth />
                    </Grid>
                    <Grid size={8}>
                    </Grid>

                    <Grid size={2}>
                        <TextField label="Attacker effect penalties" variant={variant} name="base-penalties" value={formData.attackInfo.basePenalties} fullWidth />
                    </Grid>
                    <Grid size={2}>
                        <TextField label="Defender effect penalties" variant={variant} name="base-penalties" value={formData.attackInfo.basePenalties} fullWidth />
                    </Grid>
                    <Grid size={8}>
                    </Grid>



                    <Grid size={12}>Positional and environment</Grid>

                    <Grid size={2}>
                        <FormControl fullWidth>
                            <InputLabel id="select-weapon-label">Restricted quarters</InputLabel>
                            <Select
                                id="select-weapon"
                                labelId="select-weapon-label"
                                label="Weapon"
                                value={formData.attackInfo.restrictedQuarters}
                                required
                                variant={variant}
                                onChange={handleRestrictedQuarterChange}>
                                {restrictedQuartersOptions.map((c, index) => (
                                    <MenuItem key={index} value={c.id}>{c.id}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={2}>
                        <TextField label="Defender size" variant={variant} name="defender-size" fullWidth disabled
                            value={formData.attackInfo.defenderSizeId ? t(`size-${formData.attackInfo.defenderSizeId}`) : ''} />
                    </Grid>
                    <Grid size={2}>
                        <TextField label="Size effect attacker HP multiplier" variant={variant} name="attacker-size-multiplier" fullWidth disabled
                            value={formData.attackInfo.sizeHpMultiplier} />
                    </Grid>
                    <Grid size={2}>
                        <TextField label="Size effect critical type modifier" variant={variant} name="attacker-size-multiplier" fullWidth disabled
                            value={formData.attackInfo.sizeCriticalTypeModifier} />
                    </Grid>
                    <Grid size={4}>
                    </Grid>

                </Grid>
                {debugMode ? (
                    <div>
                        <h2>formData</h2>
                        <pre>
                            {JSON.stringify(formData, null, 2)}
                        </pre>
                        <h2>character</h2>
                        <pre>
                            {JSON.stringify(character, null, 2)}
                        </pre>
                        <h2>characters</h2>
                        <pre>
                            {JSON.stringify(characters, null, 2)}
                        </pre>
                    </div>
                ) : null}
            </div>
        </>
    );
}

export default TacticalAttackCreation;