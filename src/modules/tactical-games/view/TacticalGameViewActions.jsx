import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
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
import { deleteTacticalGame, startRound } from '../../api/tactical-games';
import CloseButton from '../../shared/buttons/CloseButton';
import DeleteButton from '../../shared/buttons/DeleteButton';
import EditButton from '../../shared/buttons/EditButton';
import PlayButton from '../../shared/buttons/PlayButton';

const TacticalGameViewActions = ({ tacticalGame }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const handleDeleteTacticalGame = async () => {
    try {
      await deleteTacticalGame(tacticalGame.id);
      navigate('/tactical/games');
    } catch (error) {
      console.error('Error deleting tactical game:', error);
    }
    // const url = `${API_TACTICAL_URL}/tactical-games/${tacticalGame.id}`;
    // try {
    //   const response = await fetch(url, { method: 'DELETE' });
    //   const deleteResponse = await response;
    //   if (deleteResponse.status == 204) {
    //     navigate('/tactical');
    //   } else {
    //     //TODO display error
    //     console.log('delete data: ' + data);
    //   }
    // } catch (error) {}
  };

  const handleEditClick = () => {
    navigate(`/tactical/edit/${tacticalGame.id}`, { state: { tacticalGame: tacticalGame } });
    return;
  };

  const handleOpenClick = async () => {
    console.log('handleOpenClick ' + tacticalGame.status);
    try {
      if (tacticalGame.status === 'created') {
        console.log('status is created');
        const game = await startRound(tacticalGame.id);
        navigate(`/tactical/combat/${game.id}`);
      } else {
        navigate(`/tactical/combat/${tacticalGame.id}`, { state: { tacticalGame: tacticalGame } });
      }
    } catch (err) {}
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDialogDeleteClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleDialogDelete = () => {
    handleDeleteTacticalGame();
    setDeleteDialogOpen(false);
  };

  if (!tacticalGame) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
        <Box>
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="/">
              Home
            </Link>
            <Link component={RouterLink} underline="hover" color="inherit" to="/tactical/games">
              Tactical
            </Link>
            <Link component={RouterLink} underline="hover" color="inherit" to="/tactical/games">
              Games
            </Link>
            <span>{tacticalGame.name}</span>
            <span>View</span>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={2}>
          <CloseButton size={80} />
          <PlayButton onClick={() => handleOpenClick()} size={80} />
          <EditButton onClick={() => handleEditClick()} size={80} />
          <DeleteButton onClick={() => handleDeleteClick()} size={80} />
        </Stack>
      </Stack>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDialogDeleteClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Tactical game delete confirmation'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to remove '{tacticalGame.name}'? This action cannot be undone
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogDeleteClose}>Cancel</Button>
          <Button onClick={handleDialogDelete} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TacticalGameViewActions;
