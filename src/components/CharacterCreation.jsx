import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";

import SaveIcon from '@mui/icons-material/Save';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { API_CORE_URL } from '../constants/environment';

const CharacterCreation = () => {

    const debugMode = true;

    const location = useLocation();
    const tacticalGame = location.state?.tacticalGame;

    const [races, setRaces] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        info: {
            level: 1,
            race: "lotr-ork",
            size: "medium",
            armorType: 1
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

    const handleSubmit = (e) => {
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value })
    };

    const handleInfoChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevState) => ({
            ...prevState,
            info: {
                ...prevState.info,
                [name]: value
            }
        }));
    };

    const handleRaceChange = (event, newValue) => {
        console.log("race change: " + event.target + "; " + newValue.value);
        setFormData((prevState) => ({
            ...prevState,
            info: {
                ...prevState.info,
                race: newValue.value
            }
        }));
    };

    const getRaces = async () => {
        const url = `${API_CORE_URL}/races`;
        try {
            const response = await fetch(url, { method: "GET", });
            const data = await response.json();
            setRaces(data.content.map(mapRace));
        } catch (error) {
            console.error("Error loading races: " + error);
        }
    };

    const mapRace = (race) => {
        return {
            value: race.id,
            label: race.name,
        }
    }

    useEffect(() => {
        getRaces();
    }, []);

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
                <Box component="form"
                    sx={{ '& > :not(style)': { m: 1, width: '80ch' } }}>
                    <TextField
                        label="Name"
                        variant="outlined"
                        fullWidth
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <Autocomplete
                        disablePortal
                        options={races}
                        onChange={handleRaceChange}
                        renderInput={(params) => <TextField {...params} label="Race" />}
                    />
                    <TextField
                        label="Level"
                        variant="outlined"
                        fullWidth
                        name="level"
                        value={formData.info.level}
                        onChange={handleInfoChange}
                        required
                    />
                    <TextField
                        label="Armor"
                        variant="outlined"
                        fullWidth
                        name="armorType"
                        value={formData.info.armorType}
                        onChange={handleInfoChange}
                        required
                    />
                    <TextField
                        label="Description"
                        variant="outlined"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        fullWidth
                    />
                </Box>
            </div>
            {
                debugMode ? (
                    <div>
                        <pre>
                            {JSON.stringify(formData, null, 2)}
                        </pre>
                        <pre>
                            {JSON.stringify(tacticalGame, null, 2)}
                        </pre>
                        <pre>
                            {JSON.stringify(races, null, 2)}
                        </pre>
                    </div>) : null}
        </div>
    );
}

export default CharacterCreation;