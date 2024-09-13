import React, { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

const TacticalGameViewActions = () => {
    const location = useLocation();
    const game = location.state?.game;

    const handleEditClick = () => {
        //TODO
    }

    return (
        <div class="tactical-game-view-actions">
            <Stack spacing={2} direction="row" sx={{
                justifyContent: "flex-end",
                alignItems: "flex-start",
            }}>
                <Button variant="contained" onClick={handleEditClick}>Edit</Button>
                <Button variant="contained">Delete</Button>
                <Button variant="contained">Close</Button>
                <Button variant="contained">Start game</Button>
            </Stack>
        </div>
    );
}

export default TacticalGameViewActions;