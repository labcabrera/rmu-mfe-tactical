import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';

import { API_TACTICAL_URL } from '../../constants/environment';

const TacticalGameViewActions = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const tacticalGame = location.state?.tacticalGame;

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
    }

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    }

    const handleDialogDeleteClose = () => {
        setDeleteDialogOpen(false);
    }

    const handleDialogDelete = () => {
        deleteTacticalGame();
        setDeleteDialogOpen(false);
    }

    return (
        <div class="tactical-game-view-actions">
            <Stack spacing={2} direction="row" sx={{
                justifyContent: "flex-end",
                alignItems: "flex-start",
            }}>
                <Button variant="outlined">Close</Button>
                <Button variant="outlined">Start game</Button>
                <IconButton variant="outlined" onClick={handleEditClick}>
                    <EditIcon />
                </IconButton>
                <IconButton variant="outlined" onClick={handleDeleteClick}>
                    <DeleteIcon />
                </IconButton>
            </Stack>
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
        </div>
    );
}

export default TacticalGameViewActions;