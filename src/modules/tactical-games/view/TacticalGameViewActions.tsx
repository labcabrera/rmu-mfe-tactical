import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Breadcrumbs, Link, Stack } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { deleteTacticalGame, startRound } from '../../api/tactical-games';
import type { TacticalGame } from '../../api/tactical-games';
import CloseButton from '../../shared/buttons/CloseButton';
import DeleteButton from '../../shared/buttons/DeleteButton';
import EditButton from '../../shared/buttons/EditButton';
import PlayButton from '../../shared/buttons/PlayButton';
import DeleteDialog from '../../shared/dialogs/DeleteDialog';

type TacticalGameViewActionsProps = {
  tacticalGame: TacticalGame;
};

const TacticalGameViewActions: React.FC<TacticalGameViewActionsProps> = ({ tacticalGame }) => {
  const navigate = useNavigate();
  const { showError } = useError();
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteTacticalGame = async () => {
    try {
      await deleteTacticalGame(tacticalGame.id);
      navigate('/tactical/games');
    } catch (err: unknown) {
      if (err instanceof Error) showError(err.message);
      else showError('An unknown error occurred');
    }
  };

  const handleEditClick = () => {
    navigate(`/tactical/games/edit/${tacticalGame.id}`, { state: { tacticalGame } });
  };

  const handleOpenClick = async () => {
    try {
      if (tacticalGame.status === 'created') {
        const game = await startRound(tacticalGame.id);
        navigate(`/tactical/combat/${game.id}`);
      } else {
        navigate(`/tactical/combat/${tacticalGame.id}`, { state: { tacticalGame } });
      }
    } catch (err) {
      if (err instanceof Error) showError('Error starting tactical game: ' + err.message);
      else showError('Error starting tactical game');
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
          <CloseButton onClick={() => {}} />
          <PlayButton onClick={handleOpenClick} />
          <EditButton onClick={handleEditClick} />
          <DeleteButton onClick={handleDeleteClick} />
        </Stack>
      </Stack>
      <DeleteDialog
        message={`Are you sure you want to delete ${tacticalGame.name} game? This action cannot be undone.`}
        onDelete={handleDialogDelete}
        open={deleteDialogOpen}
        onClose={handleDialogDeleteClose}
      />
    </>
  );
};

export default TacticalGameViewActions;
