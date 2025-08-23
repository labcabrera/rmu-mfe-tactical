import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import TacticalGameViewActions from './game-view-actions';
import TacticalGameViewCharacters from "./game-view-characters";
import TacticalGameViewInfo from "./game-view-info";

import {fetchTacticalGame} from '../../../modules/api/tactical-games';

const TacticalGameView = () => {
    const location = useLocation();
    const { gameId } = useParams();
    const [tacticalGame, setTacticalGame] = useState();

    const fetchTacticalGame = async (gameId) => {
        const response = await fetchTacticalGame(gameId);
        setTacticalGame(response);
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
        <>
            <TacticalGameViewActions tacticalGame={tacticalGame} />
                <Box sx={{ flexGrow: 1 }}>
                    <Grid container spacing={2}>
                        <Grid item size={{ xs: 12, md: 4 }}>
                            <TacticalGameViewInfo tacticalGame={tacticalGame} />
                        </Grid>
                        <Grid item size={{ xs: 12, md: 8 }}>
                            <TacticalGameViewCharacters tacticalGame={tacticalGame} />
                        </Grid>
                    </Grid>
                </Box>
                            <pre>
                                {JSON.stringify(tacticalGame, null, 2)}
                            </pre>
        </>
    );
}

export default TacticalGameView;
