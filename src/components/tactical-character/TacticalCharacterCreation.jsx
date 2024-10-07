import React, { useState } from 'react';
import { useLocation } from "react-router-dom";

import Grid from '@mui/material/Grid2';

import SnackbarError from '../shared/SnackbarError';
import TacticalCharacterCreationActions from './TacticalCharacterCreationActions';
import TacticalCharacterCreationAttributes from './TacticalCharacterCreationAttributes';
import TacticalCharacterStatisticsModification from './TacticalCharacterStatisticsModification';

const TacticalCharacterCreation = () => {

    const debugMode = true;

    const location = useLocation();

    const tacticalGame = location.state?.tacticalGame;
    const [displayError, setDisplayError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [formData, setFormData] = useState({
        name: '',
        tacticalGameId: tacticalGame.id,
        faction: 'Neutral',
        info: {
            level: 1,
            race: '',
            sizeId: '',
            height: '',
            weight: ''
        },
        statistics: {
            ag: { bonus: 0, racial: 0, custom: 0, totalBonus: 0 },
            co: { bonus: 0, racial: 0, custom: 0, totalBonus: 0 },
            em: { bonus: 0, racial: 0, custom: 0, totalBonus: 0 },
            in: { bonus: 0, racial: 0, custom: 0, totalBonus: 0 },
            me: { bonus: 0, racial: 0, custom: 0, totalBonus: 0 },
            pr: { bonus: 0, racial: 0, custom: 0, totalBonus: 0 },
            qu: { bonus: 0, racial: 0, custom: 0, totalBonus: 0 },
            re: { bonus: 0, racial: 0, custom: 0, totalBonus: 0 },
            sd: { bonus: 0, racial: 0, custom: 0, totalBonus: 0 },
            st: { bonus: 0, racial: 0, custom: 0, totalBonus: 0 }
        },
        movement: {
            strideCustomBonus: 0,
            strideRacialBonus: 0
        },
        initiative: {
            customBonus: 0,
        },
        defense: {
            armorType: 1,
            defensiveBonus: 0
        },
        hp: {
            max: 40
        },
        endurance: {
            max: 20
        },
        power: {
            max: 0
        },
        skills: [],
        items: [],
        description: ''
    });

    const onError = (message) => {
        setDisplayError(true);
        setErrorMessage(message);
    };

    if (!tacticalGame || !formData) {
        return <p>Loading...</p>
    }

    return (
        <div className="tactical-game-character-creation">
            <TacticalCharacterCreationActions tacticalGame={tacticalGame} formData={formData} onError={onError} />
            <div>
                <Grid container spacing={2}>
                    <Grid size={6}>
                        <TacticalCharacterCreationAttributes formData={formData} setFormData={setFormData} factions={tacticalGame.factions} />
                    </Grid>
                    <Grid size={2}></Grid>
                    <Grid size={3}>
                        <TacticalCharacterStatisticsModification formData={formData} setFormData={setFormData} size='small' variant='standard' />
                    </Grid>
                </Grid>
                <SnackbarError displayError={displayError} setDisplayError={setDisplayError} errorMessage={errorMessage} />
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
                    </div>) : null}
        </div>
    );
}

export default TacticalCharacterCreation;