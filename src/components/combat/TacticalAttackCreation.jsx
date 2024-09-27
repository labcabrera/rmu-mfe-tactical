import React, { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';

import SaveIcon from '@mui/icons-material/Save';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Rating from '@mui/material/Rating';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { API_TACTICAL_URL } from "../../constants/environment";

const TacticalAttackCreation = () => {

    const debugMode = true;

    const minActionPoints = 2;

    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { t, i18n } = useTranslation();

    const phaseStart = searchParams.get('phaseStart');
    const tacticalGame = location.state?.tacticalGame;
    const character = location.state?.character;
    const characters = location.state?.characters;

    //const [targetCharacter, setTargetCharacter] = useState(null);

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
            offensiveBonus: 0,
            defensiveBonus: 0,
            basePenalties: 0,
            pacePenalty: 0,
            attackerSizeId: character.info.sizeId,
            defenderSizeId: '',
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value })
    }

    const handleTargetChange = (e) => {
        const targetCharacterId = e.target.value;
        const targetCharacter = characters.find(e => e.id == targetCharacterId);
        console.log("target: " + JSON.stringify(targetCharacter, null, 2));
        setFormData({ ...formData, tacticalCharacterTargetId: targetCharacterId });
        updateFormData('attackInfo', 'defenderSizeId', targetCharacter.info.sizeId);
    };

    const handleActionPointsChange = (e) => {
        const actionPoints = Math.max(minActionPoints, parseInt(e.target.value));
        setFormData({ ...formData, actionPoints: actionPoints })
    };

    const handleSelectedWeaponChange = (e) => { updateFormData('attackInfo', 'selectedWeapon', e.target.value) };

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
        <div className="tactical-game-creation">
            <div className="tactical-game-character-creation-actions">
                <Stack spacing={2} direction="row" sx={{
                    justifyContent: "flex-end",
                    alignItems: "flex-start",
                }}>
                    <IconButton variant="outlined" onClick={handleSubmit}>
                        <SaveIcon />
                    </IconButton>
                </Stack>
            </div>
            <Grid container spacing={1}>
                <Grid size={6}>
                    <Typography component="legend">Action points</Typography>
                    <Rating
                        name="size-large"
                        value={formData.actionPoints}
                        defaultValue={2}
                        max={4}
                        size="large"
                        onChange={handleActionPointsChange} />
                </Grid>
                <Grid size={6}>
                </Grid>
                <Grid size={6}>
                    <FormControl fullWidth>
                        <InputLabel id="select-target-label">Target</InputLabel>
                        <Select
                            id="select-target"
                            labelId="select-target-label"
                            label="Target"
                            value={formData.tacticalCharacterTargetId}
                            required
                            onChange={handleTargetChange}>
                            {characters.filter(e => e.id != character.id).map((c, index) => (
                                <MenuItem key={index} value={c.id}>{c.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={6}>
                </Grid>
                <Grid size={6}>
                    <FormControl fullWidth>
                        <InputLabel id="select-weapon-label">Weapon</InputLabel>
                        <Select
                            id="select-weapon"
                            labelId="select-weapon-label"
                            label="Weapon"
                            value={formData.attackInfo.selectedWeapon}
                            required
                            onChange={handleSelectedWeaponChange}>
                            {availableWeapons.map((c, index) => (
                                <MenuItem key={index} value={c}>{c}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={6}>
                </Grid>
                <Grid size={3}>
                    <TextField
                        label="Offensive bonus"
                        variant="outlined"
                        fullWidth
                        name="offensive-bonus"
                        value={formData.attackInfo.offensiveBonus}
                        //onChange={handleChange}
                        margin="normal"
                        required />
                </Grid>
                <Grid size={9}>
                </Grid>

                <Grid size={3}>
                    <TextField
                        label="Defensive bonus"
                        variant="outlined"
                        name="defensive-bonus"
                        value={formData.attackInfo.defensiveBonus}
                        onChange={handleChange}
                        fullWidth
                        margin="normal" />
                </Grid>
                <Grid size={9}>
                </Grid>

                <Grid size={3}>
                    <TextField
                        label="Base penalties"
                        variant="outlined"
                        name="base-penalties"
                        value={formData.attackInfo.basePenalties}
                        // onChange={handleChange}
                        fullWidth
                        margin="normal" />
                </Grid>
                <Grid size={9}>
                </Grid>

                <Grid size={3}>
                    <TextField
                        label="Attacker size"
                        variant="outlined"
                        name="attacker-size"
                        value={t(`size-${formData.attackInfo.attackerSizeId}`)}
                        // onChange={handleChange}
                        fullWidth
                        margin="normal" />
                </Grid>
                <Grid size={3}>
                    <TextField
                        label="Defender size"
                        variant="outlined"
                        name="defender-size"
                        value={formData.attackInfo.defenderSizeId ? t(`size-${formData.attackInfo.defenderSizeId}`) : ''}
                        // onChange={handleChange}
                        fullWidth
                        margin="normal" />
                </Grid>
                <Grid size={6}>
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
    );
}

export default TacticalAttackCreation;