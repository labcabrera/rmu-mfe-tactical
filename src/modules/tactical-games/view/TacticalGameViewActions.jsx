/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { useError } from '../../../ErrorContext';
import { deleteTacticalGame, startRound } from '../../api/tactical-games';
import CloseButton from '../../shared/buttons/CloseButton';
import DeleteButton from '../../shared/buttons/DeleteButton';
import EditButton from '../../shared/buttons/EditButton';
import PlayButton from '../../shared/buttons/PlayButton';
import DeleteDialog from '../../shared/dialogs/DeleteDialog';

const TacticalGameViewActions = ({ tacticalGame }) => {
  const navigate = useNavigate();
  const { showError } = useError();
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteTacticalGame = async () => {
    try {
      await deleteTacticalGame(tacticalGame.id);
      navigate('/tactical/games');
    } catch (error) {
      console.error('Error deleting tactical game:', error);
    }
  };

  const handleEditClick = () => {
    navigate(`/tactical/games/edit/${tacticalGame.id}`, { state: { tacticalGame: tacticalGame } });
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
    } catch (err) {
      showError('Error starting tactical game: ', err);
    }
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
            <Link color="inherit" href="/">
              {t('home')}
            </Link>
            <Link component={RouterLink} color="inherit" to="/tactical/games">
              {t('tactical')}
            </Link>
            <Link component={RouterLink} color="inherit" to="/tactical/games">
              {t('games')}
            </Link>
            <span>{tacticalGame.name}</span>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={2}>
          <CloseButton size={80} />
          <PlayButton onClick={() => handleOpenClick()} size={80} />
          <EditButton onClick={() => handleEditClick()} size={80} />
          <DeleteButton onClick={() => handleDeleteClick()} size={80} />
        </Stack>
      </Stack>
      <DeleteDialog
        message={`Are you sure you want to delete ${tacticalGame.name} game? This action cannot be undone.`}
        onDelete={() => handleDialogDelete()}
        open={deleteDialogOpen}
        onClose={() => handleDialogDeleteClose()}
      />
    </>
  );
};

export default TacticalGameViewActions;
