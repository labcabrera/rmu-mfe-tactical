import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";

import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { API_CORE_URL, API_TACTICAL_URL } from '../../constants/environment';

const TacticalCharacterCreation = () => {

    const debugMode = true;
    const variant = 'standard';

    const location = useLocation();
    const navigate = useNavigate();
    const tacticalGame = location.state?.tacticalGame;

    const levels = Array.from({ length: 101 }, (_, index) => index);

    const [displayError, setDisplayError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [races, setRaces] = useState([]);
    const [armorTypes, setArmorTypes] = useState([]);
    const [characterSizes, setCharacterSizes] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        tacticalGameId: tacticalGame.id,
        faction: 'Neutral',
        info: {
            level: 1,
            race: "lotr-orc",
            sizeId: "medium",
            baseMovementRate: 20
        },
        initiative: {
            base: 0,
        },
        defense: {
            armorType: 1,
            defensiveBonus: 0
        },
        hp: {
            max: 25,
            current: 25
        },
        skills: [],
        items: [],
        description: ''
    });

    useEffect(() => {
        const fetchArmorTypes = async () => {
            const response = await fetch(`${API_CORE_URL}/armor-types`);
            const data = await response.json();
            setArmorTypes(data);
        };
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
        fetchArmorTypes();
        fetchCharacterSizes();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = `${API_TACTICAL_URL}/characters`;
        try {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            };
            const response = await fetch(url, requestOptions);
            if (response.status == 201) {
                navigate("/tactical/view/" + tacticalGame.id, { state: { tacticalGame: tacticalGame } });
            } else {
                const data = await response.json();
                showError(`Error creating chracter ${url}. Status: ${response.status}. Message ${data.message}`);
            }
        } catch (error) {
            setDisplayError(true);
            setErrorMessage(`Error loading realms from ${url}. ${error.message}`);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFactionChange = (e) => setFormData({ ...formData, faction: e.target.value });

    const handleLevelChange = (e) => updateFormData('info', 'level', e.target.value);
    const handleRaceChange = (e) => updateFormData('info', 'race', e.target.value);
    const handleBaseMovementRateChange = (e) => updateFormData('info', 'baseMovementRate', e.target.value ? parseInt(e.target.value) : 0);
    const handleArmorTypeChange = (e) => updateFormData('defense', 'armorType', e.target.value);
    const handleDefensiveBonusChange = (e) => updateFormData('defense', 'defensiveBonus', e.target.value ? parseInt(e.target.value) : 0);
    const handleSizeChange = (e) => updateFormData('info', 'sizeId', e.target.value);
    const handleHpMaxChange = (e) => updateFormData('hp', 'max', e.target.value);
    const handleHpCurrentChange = (e) => { updateFormData('hp', 'current', e.target.value) };
    const handleInitiativeChange = (e) => { updateFormData('initiative', 'base', e.target.value ? parseInt(e.target.value) : 0) };

    const updateFormData = (field1, field2, value) => {
        setFormData((prevState) => ({
            ...prevState,
            [field1]: {
                ...prevState[field1],
                [field2]: value
            }
        }));
    };

    const handleSnackbarClose = () => {
        setDisplayError(false);
    };

    const showError = (message) => {
        setDisplayError(true);
        setErrorMessage(message);
    }

    return (
        <div className="tactical-game-character-creation">
            <div className="tactical-game-character-creation-actions">
                <Stack spacing={2} direction="row" sx={{
                    justifyContent: "flex-end",
                    alignItems: "flex-start",
                }}>
                    <IconButton variant={variant} onClick={handleSubmit}>
                        <SaveIcon />
                    </IconButton>
                </Stack>
            </div>
            <div>
                <Grid container spacing={2}>
                    <Grid size={3}>
                        <TextField label="Name" variant={variant} fullWidth name="name" value={formData.name} onChange={handleChange} required />
                    </Grid>
                    <Grid size={3}>
                        <FormControl fullWidth>
                            <InputLabel id="select-race-label">Race</InputLabel>
                            <Select
                                id="select-race" labelId="select-race-label" label="Race" value={formData.raceId} variant={variant} required
                                onChange={handleRaceChange}>
                                {races.map((option, index) => (<MenuItem key={index} value={option.id}>{option.name}</MenuItem>))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={3}>
                        <FormControl fullWidth>
                            <InputLabel id="select-faction-label">Faction</InputLabel>
                            <Select
                                id="select-faction" labelId="select-faction" label="Faction" value={formData.faction} variant={variant} required
                                onChange={handleFactionChange}>
                                {tacticalGame.factions.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
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

                    <Grid size={3}>
                        <FormControl fullWidth>
                            <InputLabel id="select-armor-type-label">Armor type</InputLabel>
                            <Select
                                id="select-armor-type"
                                labelId="select-armor-type-label"
                                label="Armor type"
                                value={formData.info.armorType}
                                required
                                fullWidth
                                variant={variant}
                                onChange={handleArmorTypeChange}>
                                {armorTypes.map((option) => (<MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>))}
                            </Select>
                        </FormControl>
                    </Grid>
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
                    <Grid size={3}>
                        <TextField label="Base movement rate" variant={variant} type="text" value={formData.info.baseMovementRate} onChange={handleBaseMovementRateChange} fullWidth />
                    </Grid>

                    <Grid size={3}>
                        <TextField label="Initiative bonus" variant={variant} type="text" value={formData.initiative.base} onChange={handleInitiativeChange} fullWidth />
                    </Grid>
                    <Grid size={9}>
                    </Grid>

                    <Grid size={3}>
                        <TextField label="Max HP" variant={variant} type="text" value={formData.hp.max} onChange={handleHpMaxChange} fullWidth />
                    </Grid>
                    <Grid size={3}>
                        <TextField label="Current HP" variant={variant} type="text" value={formData.hp.current} onChange={handleHpCurrentChange} fullWidth />
                    </Grid>
                    <Grid size={3}>
                    </Grid>
                    <Grid size={3}>
                    </Grid>


                    <Grid size={12}>
                        <TextField label="Description" variant={variant} name="description" value={formData.description} onChange={handleChange} fullWidth multiline maxRows={4} />
                    </Grid>
                </Grid>

                <Box component="form"
                    sx={{ '& > :not(style)': { m: 1, width: '80ch' } }}>
                </Box>
                <Snackbar
                    open={displayError}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    onClose={handleSnackbarClose}
                    message={errorMessage}
                    action={
                        <React.Fragment>
                            <IconButton
                                aria-label="close"
                                color="inherit"
                                sx={{ p: 0.5 }}
                                onClick={handleSnackbarClose}>
                                <CloseIcon />
                            </IconButton>
                        </React.Fragment>
                    }
                />
            </div>
            {
                debugMode ? (
                    <div>
                        <h3>formData</h3>
                        <pre>
                            {JSON.stringify(formData, null, 2)}
                        </pre>
                        <h3>tacticalGame</h3>
                        <pre>
                            {JSON.stringify(tacticalGame, null, 2)}
                        </pre>
                        <h3>races</h3>
                        <pre>
                            {JSON.stringify(races, null, 2)}
                        </pre>
                        <h3>armorTypes</h3>
                        <pre>
                            {JSON.stringify(armorTypes, null, 2)}
                        </pre>
                    </div>) : null}
        </div>
    );
}

export default TacticalCharacterCreation;