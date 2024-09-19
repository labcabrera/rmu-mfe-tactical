import React, { useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";

import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { API_TACTICAL_URL } from "../../constants/environment";

const TacticalCharacterEdit = () => {

    const debugMode = true;
    const location = useLocation();
    const tacticalCharacter = location.state?.tacticalCharacter;
    const tacticalGame = location.state?.tacticalGame;

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: tacticalCharacter.name,
        tacticalGameId: tacticalCharacter.tacticalGameId,
        info: tacticalCharacter.info,
        hp: tacticalCharacter.hp,
        description: tacticalCharacter.description
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value })
    }

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            const url = `${API_TACTICAL_URL}/characters/${tacticalCharacter.id}`;
            const requestOptions = {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            };
            const result = await fetch(url, requestOptions);
            if (result.status == 200) {
                navigate(`/tactical/view/${tacticalCharacter.tacticalGameId}`, { state: { tacticalGame: tacticalGame } });
            } else {
                //TODO display error
                console.log("delete data: " + data);
            }
        } catch (error) {
            //TODO display error
        }
    }

    const handleCancelClick = (e) => {
        navigate(`/tactical/view/${tacticalCharacter.tacticalGameId}`, { state: { tacticalGame: tacticalGame } });
    }

    return (
        <div>
            <div class="tactical-character-edit">
                <div class="tactical-character-edit-actions">
                    <Stack spacing={2} direction="row" sx={{
                        justifyContent: "flex-end",
                        alignItems: "flex-start",
                    }}>
                        <IconButton variant="outlined" onClick={handleCancelClick}>
                            <CancelIcon />
                        </IconButton>
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
                            margin="normal"
                            required />
                        <TextField
                            label="Description"
                            variant="outlined"
                            fullWidth
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            margin="normal"
                            multiline
                            maxRows={4}
                            required />
                    </Box>
                </div>
            </div>
            {debugMode ? (
                <div>
                    <h3>formData</h3>
                    <pre>
                        {JSON.stringify(formData, null, 2)}
                    </pre>
                    <h3>tacticalCharacter</h3>
                    <pre>
                        {JSON.stringify(tacticalCharacter, null, 2)}
                    </pre>
                    <h3>tacticalGame</h3>
                    <pre>
                        {JSON.stringify(tacticalGame, null, 2)}
                    </pre>
                </div>
            ) : null}
        </div>
    );
}

export default TacticalCharacterEdit;