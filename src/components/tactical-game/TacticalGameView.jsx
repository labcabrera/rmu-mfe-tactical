import React from "react";
import { useLocation } from "react-router-dom";

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';

import TacticalGameViewActions from './TacticalGameViewActions';
import TacticalGameViewCharacters from "./TacticalGameViewCharacters";
import TacticalGameViewInfo from "./TacticalGameViewInfo";

const TacticalGameView = () => {

    const debugMode = false;

    const location = useLocation();
    const tacticalGame = location.state?.tacticalGame;

    return (
        <div className="tactical-game-view">
            <TacticalGameViewActions />
            <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                    <Grid size={6}>
                        <TacticalGameViewInfo tacticalGame={tacticalGame} />
                    </Grid>
                    <Grid size={6}>
                        <TacticalGameViewCharacters tacticalGame={tacticalGame} />
                    </Grid>
                </Grid>
            </Box>
            {
                debugMode ? (
                    <div>
                        <pre>
                            {JSON.stringify(tacticalGame, null, 2)}
                        </pre>
                    </div>
                ) : null}
        </div >
    );
}

export default TacticalGameView;
