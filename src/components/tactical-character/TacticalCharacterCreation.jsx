import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";

import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import Autocomplete from '@mui/material/Autocomplete';
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

    const location = useLocation();
    const navigate = useNavigate();
    const tacticalGame = location.state?.tacticalGame;

    const levels = Array.from({ length: 101 }, (_, index) => index);

    const [displayError, setDisplayError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [factions, setFactions] = useState(tacticalGame.factions);

    const [races, setRaces] = useState([]);
    const [armorTypes, setArmorTypes] = useState([]);
    const [characterSizes, setCharacterSizes] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        tacticalGameId: tacticalGame.id,
        faction: 'Neutral',
        info: {
            level: 1,
            race: "lotr-ork",
            sizeId: "medium",
            armorType: 2
        },
        hp: {
            max: 25,
            current: 25
        },
        skills: [],
        items: [],
        equipment: {
            mainHand: "",
            offHand: "",
            head: "",
            body: ""
        },
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
            setRaces(data.content.map((item) => { return { value: item.id, label: item.name } }));
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

    const handleFactionChange = (event, newValue) => {
        setFormData({ ...formData, ['faction']: newValue });
    };

    const handleLevelChange = (e) => {
        updateFormData('info', 'level', e.target.value);
    };

    const handleRaceChange = (e, newValue) => {
        updateFormData('info', 'race', newValue.value);
    };

    const handleArmorTypeChange = (e) => {
        updateFormData('info', 'armorType', e.target.value);
    };

    const handleSizeChange = (e) => {
        updateFormData('info', 'sizeId', e.target.value);
    };

    const handleHpMaxChange = (e) => updateFormData('hp', 'max', e.target.value);
    const handleHpCurrentChange = (e) => { updateFormData('hp', 'current', e.target.value) };

    const updateFormData = (field1, field2, value) => {
        setFormData((prevState) => ({
            ...prevState,
            [field1]: {
                ...prevState[field1],
                [field2]: value
            }
        }));
    }

    const handleSnackbarClose = () => {
        setDisplayError(false);
    };

    const showError = (message) => {
        setDisplayError(true);
        setErrorMessage(message);
    }

    return (
        <div class="tactical-game-character-creation">
            <div class="tactical-game-character-creation-actions">
                <Stack spacing={2} direction="row" sx={{
                    justifyContent: "flex-end",
                    alignItems: "flex-start",
                }}>
                    <IconButton variant="outlined" onClick={handleSubmit}>
                        <SaveIcon />
                    </IconButton>
                </Stack>
            </div>
            <div>
                <Grid container spacing={2}>
                    <Grid size={4}>
                        <Autocomplete
                            disablePortal
                            options={factions}
                            onChange={handleFactionChange}
                            required
                            renderInput={(params) => <TextField {...params} label="Faction" />}
                        />
                    </Grid>
                    <Grid size={4}>
                        <Autocomplete
                            disablePortal
                            options={races}
                            onChange={handleRaceChange}
                            required
                            renderInput={(params) => <TextField {...params} label="Race" />}
                        />
                    </Grid>
                    <Grid size={4}>
                        <FormControl fullWidth>
                            <InputLabel id="select-level-label">Level</InputLabel>
                            <Select
                                id="select-level"
                                labelId="select-level-label"
                                label="Level"
                                value={formData.info.level}
                                required
                                onChange={handleLevelChange}>
                                {levels.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={4}>
                        <TextField
                            label="Name"
                            variant="outlined"
                            fullWidth
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid size={4}>
                        <FormControl fullWidth>
                            <InputLabel id="select-armor-type-label">Armor type</InputLabel>
                            <Select
                                id="select-armor-type"
                                labelId="select-armor-type-label"
                                label="Armor type"
                                value={formData.info.armorType}
                                required
                                fullWidth
                                onChange={handleArmorTypeChange}>
                                {armorTypes.map((option) => (<MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={4}>
                        <FormControl fullWidth>
                            <InputLabel id="select-size-label">Size</InputLabel>
                            <Select
                                id="select-size"
                                labelId="select-size-label"
                                label="Size"
                                value={formData.info.sizeId}
                                required
                                fullWidth
                                onChange={handleSizeChange}>
                                {characterSizes.map((option) => (<MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={4}>
                        <TextField
                            label="Max HP"
                            variant="outlined"
                            type="text"
                            value={formData.hp.max}
                            onChange={handleHpMaxChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid size={4}>
                        <TextField
                            label="Max HP"
                            variant="outlined"
                            type="text"
                            value={formData.hp.current}
                            onChange={handleHpCurrentChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid size={12}>
                        <TextField
                            label="Description"
                            variant="outlined"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            maxRows={4}
                        />
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