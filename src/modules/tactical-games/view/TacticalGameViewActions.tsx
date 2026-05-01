import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import {
  CancelButton,
  DeleteButton,
  DeleteDialog,
  deleteTacticalGame,
  EditButton,
  fetchTacticalGame,
  RefreshButton,
  RmuBreadcrumbs,
  startRound,
  TacticalGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import PlayButton from '../../shared/buttons/PlayButton';

const TacticalGameViewActions: FC<{
  tacticalGame: TacticalGame;
  setTacticalGame: Dispatch<SetStateAction<TacticalGame | undefined>>;
}> = ({ tacticalGame, setTacticalGame }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showError } = useError();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const onDelete = () => {
    deleteTacticalGame(tacticalGame.id, auth)
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
      startRound(tacticalGame.id, auth)
        .then((data) => navigate(`/tactical/combat/${data.id}`, { state: { tacticalGame: data } }))
        .catch((err) => showError(err.message));
    } else {
      navigate(`/tactical/combat/${tacticalGame.id}`, { state: { tacticalGame } });
    }
  };

  const onRefresh = () => {
    fetchTacticalGame(tacticalGame.id, auth)
      .then((response) => setTacticalGame(response))
      .catch((err) => showError(err.message));
  };

  return (
    <>
      <RmuBreadcrumbs
        items={[
          { name: t('home'), link: '/' },
          { name: t('strategic-games'), link: '/tactical/games' },
          { name: t('strategic-game') },
        ]}
      >
        <CancelButton onClick={() => {}} />
        <PlayButton onClick={() => onPlay()} />
        <RefreshButton onClick={() => onRefresh()} />
        <EditButton onClick={() => onEdit()} />
        <DeleteButton onClick={() => setDeleteDialogOpen(true)} />
      </RmuBreadcrumbs>
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
