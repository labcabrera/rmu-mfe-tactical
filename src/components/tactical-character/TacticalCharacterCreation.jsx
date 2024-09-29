import React, { useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";

import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import TacticalCharacterCreationAttributes from './TacticalCharacterCreationAttributes';

import { API_TACTICAL_URL } from '../../constants/environment';

const TacticalCharacterCreation = () => {

    const debugMode = true;
    const variant = 'standard';

    const location = useLocation();
    const navigate = useNavigate();
    const tacticalGame = location.state?.tacticalGame;
    const [displayError, setDisplayError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [races, setRaces] = useState([]);
    const [armorTypes, setArmorTypes] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        tacticalGameId: tacticalGame.id,
        faction: 'Neutral',
        info: {
            level: 1,
            race: "lotr-human",
            sizeId: "medium",
            baseMovementRate: 20
        },
        initiative: {
            base: 0,
        },
        defense: {
            armorType: 1,
            defensiveBonus: 0
        },
        hp: {
            max: 25,
            current: 25
        },
        skills: [],
        items: [],
        description: ''
    });

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
                showError(`Error creating chracter ${url}. Status: ${response.status}. Message ${data.message}`);
            }
        } catch (error) {
            setDisplayError(true);
            setErrorMessage(`Error loading realms from ${url}. ${error.message}`);
        }
    };

    const handleSnackbarClose = () => {
        setDisplayError(false);
    };

    const handleBackClick = () => {
        navigate(`/tactical/view/${tacticalGame.id}`, {state: {tacticalGame: tacticalGame}});
    };

    const showError = (message) => {
        setDisplayError(true);
        setErrorMessage(message);
    };

    if(!tacticalGame) {
        return <p>Loading...</p>
    }

    return (
        <div className="tactical-game-character-creation">
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
            <div>
                <TacticalCharacterCreationAttributes formData={formData} setFormData={setFormData} factions={tacticalGame.factions} />
                <Box component="form"
                    sx={{ '& > :not(style)': { m: 1, width: '80ch' } }}>
                </Box>
                <Snackbar
                    open={displayError}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    onClose={handleSnackbarClose}
                    message={errorMessage}
                    action={
                        <React.Fragment>
                            <IconButton
                                aria-label="close"
                                color="inherit"
                                sx={{ p: 0.5 }}
                                onClick={handleSnackbarClose}>
                                <CloseIcon />
                            </IconButton>
                        </React.Fragment>
                    }
                />
            </div>
            {
                debugMode ? (
                    <div>
                        <h3>formData</h3>
                        <pre>
                            {JSON.stringify(formData, null, 2)}
                        </pre>
                        <h3>tacticalGame</h3>
                        <pre>
                            {JSON.stringify(tacticalGame, null, 2)}
                        </pre>
                        <h3>races</h3>
                        <pre>
                            {JSON.stringify(races, null, 2)}
                        </pre>
                        <h3>armorTypes</h3>
                        <pre>
                            {JSON.stringify(armorTypes, null, 2)}
                        </pre>
                    </div>) : null}
        </div>
    );
}

export default TacticalCharacterCreation;