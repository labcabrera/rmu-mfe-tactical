import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

import TacticalGameViewActions from './TacticalGameViewActions';

const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    color: theme.palette.text.secondary,
    ...theme.applyStyles('dark', {
    }),
}));

const TacticalGameView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const game = location.state?.game;

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
                        value={game.name}
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
                        value={game.status}
                    ></TextField>
                </div>
                <div>
                    <TextField
                        label="Description"
                        name="description"
                        value={game.description}
                    ></TextField>
                </div>
                <div>
                    <TextField
                        label="User"
                        name="user"
                        value={game.user}
                    ></TextField>
                </div>
                <div>
                    <TextField
                        label="createdAt"
                        name="createdAt"
                        value={game.createdAt}
                    ></TextField>
                </div>
            </Box >
            <pre>
                {JSON.stringify(game, null, 2)}
            </pre>
            <pre>
                {JSON.stringify(location.state, null, 2)}
            </pre>
        </div >
    );
}

export default TacticalGameView;
