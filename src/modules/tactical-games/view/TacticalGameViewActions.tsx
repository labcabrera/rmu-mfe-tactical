import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Breadcrumbs, Link, Stack } from '@mui/material';
import { CancelButton, RefreshButton } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { deleteTacticalGame, fetchTacticalGame, startRound } from '../../api/tactical-game';
import { TacticalGame } from '../../api/tactical-game.dto';
import DeleteButton from '../../shared/buttons/DeleteButton';
import EditButton from '../../shared/buttons/EditButton';
import PlayButton from '../../shared/buttons/PlayButton';
import DeleteDialog from '../../shared/dialogs/DeleteDialog';

const TacticalGameViewActions: FC<{
  tacticalGame: TacticalGame;
  setTacticalGame: Dispatch<SetStateAction<TacticalGame | undefined>>;
}> = ({ tacticalGame, setTacticalGame }) => {
  const navigate = useNavigate();
  const { showError } = useError();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const onDelete = () => {
    deleteTacticalGame(tacticalGame.id)
      .then(() => {
        navigate('/tactical/games');
        setDeleteDialogOpen(false);
      })
      .catch((err) => showError(err.message));
  };

  const onEdit = () => {
    navigate(`/tactical/games/edit/${tacticalGame.id}`, { state: { tacticalGame } });
  };

  const onPlay = async () => {
    if (tacticalGame.status === 'created') {
      startRound(tacticalGame.id)
        .then((data) => navigate(`/tactical/combat/${data.id}`, { state: { tacticalGame: data } }))
        .catch((err) => showError(err.message));
    } else {
      navigate(`/tactical/combat/${tacticalGame.id}`, { state: { tacticalGame } });
    }
  };

  const onRefresh = () => {
    fetchTacticalGame(tacticalGame.id)
      .then((response) => setTacticalGame(response))
      .catch((err) => showError(err.message));
  };

  return (
    <>
      <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
        <Box>
          <Breadcrumbs aria-label="breadcrumb">
            <Link color="primary" underline="hover" href="/">
              {t('home')}
            </Link>
            <Link component={RouterLink} color="primary" underline="hover" to="/tactical/games">
              {t('tactical')}
            </Link>
            <Link component={RouterLink} color="primary" underline="hover" to="/tactical/games">
              {t('games')}
            </Link>
            <span>{tacticalGame.name}</span>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <CancelButton onClick={() => {}} />
          <PlayButton onClick={() => onPlay()} />
          <RefreshButton onClick={() => onRefresh()} />
          <EditButton onClick={() => onEdit()} />
          <DeleteButton onClick={() => setDeleteDialogOpen(true)} />
        </Stack>
      </Stack>
      <DeleteDialog
        message={`Are you sure you want to delete ${tacticalGame.name} game? This action cannot be undone.`}
        onDelete={() => onDelete()}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </>
  );
};

export default TacticalGameViewActions;
