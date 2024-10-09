import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';

import TacticalGameViewActions from './TacticalGameViewActions';
import TacticalGameViewCharacters from "../TacticalGameViewCharacters";
import TacticalGameViewInfo from "../TacticalGameViewInfo";

import { API_TACTICAL_URL } from "../../../constants/environment";

const TacticalGameView = () => {

    const debugMode = false;

    const location = useLocation();
    const { gameId } = useParams();

    const [tacticalGame, setTacticalGame] = useState();

    const fetchTacticalGame = async (tacticalGameId) => {
        const response = await fetch(`${API_TACTICAL_URL}/tactical-games/${tacticalGameId}`, { method: 'GET' });
        const responseBody = await response.json();
        setTacticalGame(responseBody);
    };

    useEffect(() => {
        if (location.state && location.state.tacticalGame) {
            console.log(`TacticalGameView.useEffect: resolved tacticalGame from state`);
            setTacticalGame(location.state.tacticalGame);
        } else {
            console.log(`TacticalGameView.useEffect: fetch tacticalGame ${gameId} from API`);
            fetchTacticalGame(gameId);
        }
    }, [location.state]);

    if (!tacticalGame) {
        return <p>Loading...</p>
    }

    return (
        <div className="generic-main-content">
            <TacticalGameViewActions tacticalGame={tacticalGame} />
            <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                    <Grid size={4}>
                        <TacticalGameViewInfo tacticalGame={tacticalGame} />
                    </Grid>
                    <Grid size={8}>
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
