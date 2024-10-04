import React from 'react';
import { useNavigate } from "react-router-dom";

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';

import { API_TACTICAL_URL } from '../../constants/environment';
import { VARIANT, VARIANT_DISABLED, SIZE } from '../../constants/ui';

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
                <IconButton variant={VARIANT} onClick={handleNavigateBackClick}>
                    <ArrowBackIcon />
                </IconButton>
                <IconButton variant={VARIANT} onClick={updateTacticalCharacter} >
                    <SaveIcon />
                </IconButton>
            </Stack>
        </div>

    );
}

export default TacticalCharacterModificationActions;