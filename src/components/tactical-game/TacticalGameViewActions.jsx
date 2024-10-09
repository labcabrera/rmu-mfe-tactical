import React from "react";
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from "react-router-dom";

import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import CloseButton from "../button/CloseButton";
import DeleteButton from "../button/DeleteButton";
import EditButton from "../button/EditButton";
import PlayButton from "../button/PlayButton";

import { API_TACTICAL_URL } from '../../constants/environment';
import { ACTION_BUTTON_SIZE } from "../../constants/ui";

const TacticalGameViewActions = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const tacticalGame = location.state?.tacticalGame;
    const { t, i18n } = useTranslation();

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

    const deleteTacticalGame = async () => {
        const url = `${API_TACTICAL_URL}/tactical-games/${tacticalGame.id}`;
        try {
            const response = await fetch(url, { method: "DELETE" });
            const deleteResponse = await response;
            if (deleteResponse.status == 204) {
                navigate("/tactical");
            } else {
                //TODO display error
                console.log("delete data: " + data);
            }
        } catch (error) {
        }
    };

    const handleEditClick = () => {
        alert("TODO");
    };

    const handleOpenClick = async () => {
        console.log("handleOpenClick " + tacticalGame.status);
        if (tacticalGame.status === "created") {
            console.log("status is created");
            const startGameResponse = await fetch(`${API_TACTICAL_URL}/tactical-games/${tacticalGame.id}/rounds/start`, { method: 'POST' });
            if (startGameResponse.status == 200) {
                navigate(`/tactical/combat/${tacticalGame.id}`);
            } else {
                const startGameResponseError = await startGameResponse.json();
                console.log("creation error: " + startGameResponseError.message);
            }
        } else {
            navigate(`/tactical/combat/${tacticalGame.id}`, { state: { tacticalGame: tacticalGame } });
        }
    };

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    const handleDialogDeleteClose = () => {
        setDeleteDialogOpen(false);
    };

    const handleDialogDelete = () => {
        deleteTacticalGame();
        setDeleteDialogOpen(false);
    };

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
                        <Link underline="hover" color="inherit" href='/tactical'>{t('tactical-games')}</Link>
                        <Typography sx={{ color: 'text.primary' }}>{tacticalGame.name}</Typography>
                    </Breadcrumbs>

                    <div style={{ flexGrow: 1 }} />

                    <CloseButton size={ACTION_BUTTON_SIZE} />
                    <PlayButton onClick={handleOpenClick} size={ACTION_BUTTON_SIZE} />
                    <EditButton onClick={handleEditClick} size={ACTION_BUTTON_SIZE} />
                    <DeleteButton onClick={handleDeleteClick} size={ACTION_BUTTON_SIZE} />

                </Stack>
            </div>
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDialogDeleteClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Tactical game delete confirmation"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to remove '{tacticalGame.name}'? This action cannot be undone
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogDeleteClose}>Cancel</Button>
                    <Button onClick={handleDialogDelete} autoFocus>Delete</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default TacticalGameViewActions;