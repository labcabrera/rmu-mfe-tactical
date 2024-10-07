import React, { useContext } from "react";

import CombatCharacterRound from "./CombatCharacterRound";
import Grid from '@mui/material/Grid2';

import { CombatContext } from './CombatProvider';

const CombatCharacterList = () => {

    const debugMode = false;

    const { characterRounds, setCharacterRounds } = useContext(CombatContext);

    if (!characterRounds) {
        return <p>Loading...</p>
    }

    return (
        <div className="combat-dashboard-list">
            <Grid container spacing={2}>
                <Grid size={2}>
                    Character
                </Grid>
                <Grid size={1}>
                    Initiative
                </Grid>
                <Grid size={1}>
                    Free action
                </Grid>
                <Grid size={1}>
                    Phase 1
                </Grid>
                <Grid size={1}>
                    Phase 2
                </Grid>
                <Grid size={1}>
                    Phase 3
                </Grid>
                <Grid size={1}>
                    Phase 4
                </Grid>
            </Grid>
            {characterRounds.map((item, index) => (
                <CombatCharacterRound key={index} characterRound={item} />
            ))}
            {debugMode ? (
                <div>
                    <h3>tacticalGame</h3>
                    <pre>
                        {JSON.stringify(tacticalGame, null, 2)}
                    </pre>
                    <h3>characters</h3>
                    <pre>
                        {JSON.stringify(characters, null, 2)}
                    </pre>
                    <h3>characterRounds</h3>
                    <pre>
                        {JSON.stringify(characterRounds, null, 2)}
                    </pre>
                </div>
            ) : null}
        </div >
    );
}

export default CombatCharacterList;
