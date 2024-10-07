import React from 'react';
import { useNavigate } from "react-router-dom";

import Stack from '@mui/material/Stack';

import CancelButton from '../button/CancelButton';
import SaveButton from '../button/SaveButton';

import { API_TACTICAL_URL } from '../../constants/environment';
import { ACTION_BUTTON_SIZE } from '../../constants/ui';

const TacticalCharacterModificationActions = ({ tacticalGame, tacticalCharacter, formData, onError }) => {

    const navigate = useNavigate();

    const handleNavigateBackClick = (e) => {
        navigate(`/tactical/view/${tacticalGame.id}`, { state: { tacticalGame: tacticalGame } });
    };

    const updateTacticalCharacter = async (e) => {
        try {
            e.preventDefault();
            const requestOptions = {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            };
            const response = await fetch(`${API_TACTICAL_URL}/characters/${tacticalCharacter.id}`, requestOptions);
            if (response.status == 200) {
                navigate(`/tactical/view/${tacticalCharacter.tacticalGameId}`, { state: { tacticalGame: tacticalGame } });
            } else {
                console.log(`TacticalCharacterModification.updateTacticalCharacter error ${response.status}`);
            }
        } catch (error) {
            console.error(`TacticalCharacterModification.updateTacticalCharacter error ${error}`);
        }
    };

    if (!tacticalGame || !formData) {
        return <p>Loading... (actions)</p>
    }

    return (
        <div className="generic-action-bar">
            <Stack spacing={2} direction="row" sx={{
                justifyContent: "flex-end",
                alignItems: "flex-start",
            }}>
                <CancelButton onClick={handleNavigateBackClick} size={ACTION_BUTTON_SIZE} />
                <SaveButton onClick={updateTacticalCharacter} size={ACTION_BUTTON_SIZE} />
            </Stack>
        </div>

    );
}

export default TacticalCharacterModificationActions;