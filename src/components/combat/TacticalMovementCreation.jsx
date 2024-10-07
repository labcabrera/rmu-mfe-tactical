import React, { useState } from 'react';
import { useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';

import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';

import ActionPointSelector from '../shared/ActionPointSelector';
import SelectPace from '../select/SelectPace';

const TacticalMovementCreation = () => {

    const variant = 'standard';

    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { t, i18n } = useTranslation();

    const phaseStart = parseInt(searchParams.get('phaseStart'));
    const tacticalGame = location.state?.tacticalGame;
    const character = location.state?.character;

    const [formData, setFormData] = useState({
        tacticalGameId: tacticalGame.id,
        round: tacticalGame.round,
        tacticalCharacterId: character.id,
        type: 'movement',
        phaseStart: phaseStart,
        actionPoints: 1,
        pace: 'walk'
    });

    const updateActionPoints = (actionPoints) => {
        console.log(`TacticalMovementCreation.updateActionPoints ${actionPoints}`);
        setFormData({ ...formData, actionPoints: actionPoints });
    };

    const updatePace = (pace, paceInfo) => {
        setFormData({ ...formData, pace: pace });
    };

    if (!tacticalGame || !character) {
        return <p>Loading...</p>
    }

    return (
        <div className="generic-main-content">
            <Grid container spacing={2}>

                <Grid size={6}>
                    <TextField label={t('character')} variant={variant} fullWidth disabled value={character.name} />
                </Grid>
                <Grid size={6}></Grid>

                <Grid size={6}>
                    <TextField label="BMR" variant={variant} fullWidth disabled value={character.movement.baseMovementRate} />
                </Grid>
                <Grid size={6}></Grid>

                <Grid size={6}>
                    <ActionPointSelector value={formData.actionPoints} min={1} max={4} defaultValue={1} onChange={updateActionPoints} />
                </Grid>
                <Grid size={6}></Grid>

                <Grid size={6}>
                    <SelectPace value={formData.pace} onChange={updatePace} />
                </Grid>
                <Grid size={6}></Grid>

            </Grid>

            <h2>formData</h2>
            <pre>
                {JSON.stringify(formData, null, 2)}
            </pre>
        </div>
    );
}

export default TacticalMovementCreation;