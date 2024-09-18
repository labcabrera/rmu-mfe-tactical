import React from "react";
import { useLocation, useParams } from "react-router-dom";

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import TacticalGameViewActions from './TacticalGameViewActions';

const TacticalGameView = () => {

    const debugMode = false;
    const { gameId } = useParams();
    const location = useLocation();
    const tacticalGame = location.state?.tacticalGame;

    return (
        <div class="tactical-game-view">
            <TacticalGameViewActions></TacticalGameViewActions>
            <Box
                component="form"
                _sx={{ flexGrow: 1 }}
                sx={{ '& > :not(style)': { m: 1, width: '25ch' } }}
            >
                <div>
                    <TextField
                        label="Name"
                        name="name"
                        value={tacticalGame.name}
                        slotProps={{
                            input: {
                                readOnly: true,
                            },
                        }} />
                </div>
                <div>
                    <TextField
                        label="Status"
                        name="status"
                        value={tacticalGame.status}
                    ></TextField>
                </div>
                <div>
                    <TextField
                        label="Description"
                        name="description"
                        value={tacticalGame.description}
                    ></TextField>
                </div>
                <div>
                    <TextField
                        label="User"
                        name="user"
                        value={tacticalGame.user}
                    ></TextField>
                </div>
                <div>
                    <TextField
                        label="createdAt"
                        name="createdAt"
                        value={tacticalGame.createdAt}
                    ></TextField>
                </div>
            </Box >
            {debugMode ? (
                <div>
                    <pre>
                        {JSON.stringify(tacticalGame, null, 2)}
                    </pre>
                    <pre>
                        {JSON.stringify(location.state, null, 2)}
                    </pre>
                </div>
            ) : null}
        </div >
    );
}

export default TacticalGameView;
