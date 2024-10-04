import React from 'react';
import { useNavigate } from "react-router-dom";

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';


import { API_TACTICAL_URL } from '../../constants/environment';

const TacticalCharacterCreationActions = ({ tacticalGame, formData, onError }) => {

    const navigate = useNavigate();
    const variant = 'standard';

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
                onError(`Error creating chracter ${url}. Status: ${response.status}. Message ${data.message}`);
            }
        } catch (error) {
            onError(`Error loading realms from ${url}. ${error.message}`);
        }
    };

    const handleBackClick = () => {
        navigate(`/tactical/view/${tacticalGame.id}`, { state: { tacticalGame: tacticalGame } });
    };


    if (!tacticalGame || !formData) {
        return <p>Loading...</p>
    }

    return (
        <div className="tactical-game-character-creation-actions">
            <Stack spacing={2} direction="row" sx={{
                justifyContent: "flex-end",
                alignItems: "flex-start",
            }}>
                <IconButton variant={variant} onClick={handleBackClick}>
                    <ArrowBackIcon />
                </IconButton>
                <IconButton variant={variant} onClick={handleSubmit}>
                    <SaveIcon />
                </IconButton>
            </Stack>
        </div>

    );
}

export default TacticalCharacterCreationActions;