import React from 'react';
import { useNavigate } from "react-router-dom";

import Stack from '@mui/material/Stack';

import CancelButton from '../../button/CancelButton';
import SaveButton from '../../button/SaveButton';

import { API_TACTICAL_URL } from '../../../constants/environment';
import { ACTION_BUTTON_SIZE } from '../../../constants/ui';

const CharacterCreationActions = ({ tacticalGame, formData, onError }) => {

    const navigate = useNavigate();

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
        return;
    };


    if (!tacticalGame || !formData) {
        return <p>Loading...</p>
    }

    return (
        <div className="generic-action-bar">
            <Stack
                spacing={2}
                direction="row"
                sx={{
                    justifyContent: "flex-end",
                    alignItems: "flex-start",
                }}>
                <CancelButton onClick={handleBackClick} size={ACTION_BUTTON_SIZE} />
                <SaveButton onClick={handleSubmit} size={ACTION_BUTTON_SIZE} />
            </Stack>
        </div >

    );
}

export default CharacterCreationActions;