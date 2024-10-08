import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';

import AddButton from "../button/AddButton";
import TacticalGameListItem from "./TacticalGameListItem";

import { API_TACTICAL_URL } from "../../constants/environment";
import { ACTION_BUTTON_SIZE } from "../../constants/ui";

const TacticalGameList = () => {

    const debugMode = true;
    const navigate = useNavigate();
    const [games, setGames] = useState([]);

    const [displayError, setDisplayError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const fetchGames = async () => {
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
        fetchGames();
    }, []);


    return (
        <div>
            <div className="generic-action-bar">
                <Stack spacing={2} direction="row" sx={{
                    justifyContent: "flex-end",
                    alignItems: "flex-start",
                }}>
                    <AddButton onClick={createNewGame} size={ACTION_BUTTON_SIZE} />
                </Stack>
            </div>
            <div className="generic-main-content">
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