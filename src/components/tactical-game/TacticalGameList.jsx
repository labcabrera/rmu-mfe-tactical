import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';

import TacticalGameListItem from "../TacticalGameListItem";

import { API_TACTICAL_URL } from "../../constants/environment";

const TacticalGameList = () => {

    const debugMode = true;
    const navigate = useNavigate();
    const [games, setGames] = useState([]);

    const [displayError, setDisplayError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const getGames = async () => {
        const url = `${API_TACTICAL_URL}/tactical-games`;
        try {
            const response = await fetch(url, { method: "GET", });
            const data = await response.json();
            setGames(data.content);
        } catch (error) {
            setDisplayError(true);
            setErrorMessage(`Error loading games from ${url}. ${error.message}`);
        }
    };

    const createNewGame = async () => {
        navigate("/tactical/creation");
    };

    const handleSnackbarClose = () => {
        setDisplayError(false);
    };

    useEffect(() => {
        getGames();
    }, []);


    return (
        <div>
            <div class="tactical-game-list-actions">
                <Stack spacing={2} direction="row" sx={{
                    justifyContent: "flex-end",
                    alignItems: "flex-start",
                }}>
                    <IconButton variant="outlined" onClick={createNewGame}>
                        <AddIcon />
                    </IconButton>
                </Stack>
            </div>
            <div class="tactical-game-list">
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {games.map((item) => (
                        <TacticalGameListItem key={item.id} tacticalGame={item} />
                    ))}
                </List>
            </div>
            <Snackbar
                open={displayError}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                onClose={handleSnackbarClose}
                message={errorMessage}
                action={
                    <React.Fragment>
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            sx={{ p: 0.5 }}
                            onClick={handleSnackbarClose}>
                            <CloseIcon />
                        </IconButton>
                    </React.Fragment>
                }
            />
        </div>
    );
}

export default TacticalGameList;