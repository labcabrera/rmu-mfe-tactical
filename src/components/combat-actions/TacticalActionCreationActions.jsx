import React from 'react';
import { useNavigate } from "react-router-dom";

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import BackButton from '../button/BackButton';
import SaveButton from '../button/SaveButton';

import { API_TACTICAL_URL } from "../../constants/environment";
import { ACTION_BUTTON_SIZE } from '../../constants/ui';

const TacticalActionCreationActions = ({ tacticalGame, formData }) => {

    const navigate = useNavigate();

    const createAction = async (e) => {
        e.preventDefault();
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        };
        const createActionResponse = await fetch(`${API_TACTICAL_URL}/actions`, requestOptions);
        if (createActionResponse.status == 201) {
            navigate(`/tactical/combat/${tacticalGame.id}`);
            return;
        } else {
            error = await createActionResponse.json();
            console.log(error.message);
        }
    }

    const handleBackClick = () => {
        navigate(`/tactical/combat/${tacticalGame.id}`);
        return;
    };

    if (!tacticalGame || !formData) {
        return <p>Loading...</p>
    }

    return (
        <div className="generic-action-bar">
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                    width: '100%'
                }}>

                <Typography variant="h5" component="div">Tactical game {tacticalGame.name} - Attack declaration</Typography>

                <div style={{ flexGrow: 1 }} />

                <BackButton onClick={handleBackClick} size={ACTION_BUTTON_SIZE} />
                <SaveButton onClick={createAction} size={ACTION_BUTTON_SIZE} />
            </Stack>
        </div>
    );
}

export default TacticalActionCreationActions;