import React from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

const TacticalGameViewActions = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { gameId } = useParams();
    const game = location.state?.game;

    const deleteGame = async () => {
        console.log("delete game " + gameId);
        const response = await fetch("http://localhost:3001/v1/tactical-games/" + gameId, {
            method: "DELETE",
        });
        const deleteResponse = await response;
        if (deleteResponse.status == 200) {
            navigate("/tactical");
        } else {
            //TODO display error
            console.log("delete data: " + data);
        }
    };

    const handleEditClick = () => {
    }

    const handleDeleteClick = () => {
        deleteGame();
    }

    return (
        <div class="tactical-game-view-actions">
            <Stack spacing={2} direction="row" sx={{
                justifyContent: "flex-end",
                alignItems: "flex-start",
            }}>
                <Button variant="contained" onClick={handleEditClick}>Edit</Button>
                <Button variant="contained" onClick={handleDeleteClick}>Delete</Button>
                <Button variant="contained">Close</Button>
                <Button variant="contained">Start game</Button>
            </Stack>
        </div>
    );
}

export default TacticalGameViewActions;