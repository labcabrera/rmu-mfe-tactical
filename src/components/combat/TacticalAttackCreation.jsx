import React, { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import SaveIcon from '@mui/icons-material/Save';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { API_TACTICAL_URL } from "../../constants/environment";

const TacticalAttackCreation = () => {

    const debugMode = true;

    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const phaseStart = searchParams.get('phaseStart');

    const tacticalGame = location.state?.tacticalGame;
    const character = location.state?.character;


    const [formData, setFormData] = useState({
        tacticalGameId: tacticalGame.id,
        round: tacticalGame.round,
        tacticalCharacterId: character.id,
        type: 'attack',
        phaseStart: phaseStart,
        actionPoints: 2
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

    return (
        <div className="tactical-game-creation">
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
            <form onSubmit={handleSubmit}>
                <Grid container spacing={5}>
                    <Grid size={3}>
                        <TextField
                            label="Name"
                            variant="outlined"
                            fullWidth
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            margin="normal"
                            required />
                    </Grid>
                    <Grid size={3}>
                        <TextField
                            label="Description"
                            variant="outlined"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            fullWidth
                            margin="normal" />
                    </Grid>
                    <Grid size={3}>

                    </Grid>
                    <Grid size={3}>

                    </Grid>
                    <Grid size={3}>

                    </Grid>
                </Grid>

                <p>wip declare attack</p>

            </form>
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
                </div>
            ) : null}
        </div>
    );
}

export default TacticalAttackCreation;