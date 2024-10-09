import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";

import CloseIcon from '@mui/icons-material/Close';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import AddButton from "../../button/AddButton";
import TacticalGameListItem from "./TacticalGameListItem";

import { API_TACTICAL_URL } from "../../../constants/environment";
import { ACTION_BUTTON_SIZE } from "../../../constants/ui";

const TacticalGameList = () => {

    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

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
        <>
            <div className="generic-action-bar">
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                        width: '100%'
                    }}>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Typography sx={{ color: 'text.primary' }}>{t('tactical-games')}</Typography>
                    </Breadcrumbs>

                    <div style={{ flexGrow: 1 }} />
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
        </>
    );
}

export default TacticalGameList;