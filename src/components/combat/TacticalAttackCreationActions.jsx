import React from 'react';
import { useNavigate } from "react-router-dom";

import SaveIcon from '@mui/icons-material/Save';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';

import { API_TACTICAL_URL } from "../../constants/environment";
import { VARIANT } from '../../constants/ui';

const TacticalAttackCreationActions = ({ tacticalGame, formData }) => {

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

    if (!tacticalGame || !formData) {
        return <p>Loading...</p>
    }

    return (
        <div className="generic-action-bar">
            <Stack spacing={2} direction="row" sx={{
                justifyContent: "flex-end",
                alignItems: "flex-start",
            }}>
                <IconButton variant={VARIANT} onClick={createAction}>
                    <SaveIcon />
                </IconButton>
            </Stack>
        </div>

    );
}

export default TacticalAttackCreationActions;