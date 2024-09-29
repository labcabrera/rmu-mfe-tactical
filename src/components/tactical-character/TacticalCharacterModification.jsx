import React, { useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";

import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';

import TacticalCharacterModificationAttributes from './TacticalCharacterModificationAttributes';
import TacticalCharacterItems from './TacticalCharacterItems';

import { API_TACTICAL_URL } from "../../constants/environment";

const TacticalCharacterModification = () => {

    const debugMode = true;

    const location = useLocation();
    const tacticalCharacter = location.state?.tacticalCharacter;
    const tacticalGame = location.state?.tacticalGame;

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        tacticalGameId: tacticalCharacter.tacticalGameId,
        name: tacticalCharacter.name,
        faction: tacticalCharacter.faction,
        info: tacticalCharacter.info,
        defense: tacticalCharacter.defense,
        hp: tacticalCharacter.hp,
        initiative: tacticalCharacter.initiative,
        effects: tacticalCharacter.effects,
        skills: tacticalCharacter.skills,
        items: tacticalCharacter.items,
        equipment: tacticalCharacter.equipment,
        description: tacticalCharacter.description
    });

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
            <div className="tactical-character-edit">
                <div className="tactical-character-edit-actions">
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
                <Grid container spacing={2}>
                    <Grid size={8}>
                        <TacticalCharacterModificationAttributes formData={formData} setFormData={setFormData} factions={tacticalGame.factions} />
                    </Grid>
                    <Grid size={4}>
                        <TacticalCharacterItems />
                    </Grid>
                </Grid>
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

export default TacticalCharacterModification;