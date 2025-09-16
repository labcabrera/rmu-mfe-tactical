import React, { FC, useContext, useState } from 'react';
import { CombatContext } from '../../CombatContext';
import { useError } from '../../ErrorContext';
import { deleteAction } from '../api/action';
import type { Action } from '../api/action';
import { ActorRound } from '../api/actor-rounds';
import type { Character } from '../api/characters';
import DeleteDialog from '../shared/dialogs/DeleteDialog';
import CircleButtonGroup from '../shared/generic/CircleButtonGroup';
import ResolveActionDialog from './resolve-action-dialog/ResolveActionDialog';

const ResolveActionCard: FC<{
  actorRound: ActorRound;
  character: Character;
  action: Action;
}> = ({ actorRound, character, action }) => {
  const { showError } = useError();
  const { roundActions, setRoundActions, game } = useContext(CombatContext)!;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);

  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteAction = async () => {
    deleteAction(action.id)
      .then(() => {
        const newActionList = roundActions.filter((e: Action) => e.id !== action.id);
        setRoundActions(newActionList);
      })
      .catch((err) => {
        showError(err.message);
      });
  };

  const handleResolve = () => {
    setResolveDialogOpen(true);
  };

  if (!action || !actorRound || !game) {
    return <p>Loading...</p>;
  }

  const options = [
    {
      src: `/static/images/actions/${action.actionType}.png`,
      alt: 'Icon action',
    },
    {
      src: '/static/images/generic/play.png',
      alt: 'Resolve',
      action: () => handleResolve(),
    },
    {
      src: '/static/images/generic/delete.png',
      alt: 'Delete action',
      action: () => handleOpenDeleteDialog(),
    },
  ];

  return (
    <>
      <CircleButtonGroup options={options} initialRotation={4.71} size={60} radius={40} xOffset={-70} yOffset={-110} backgroundColor="#212121" />
      <ResolveActionDialog
        action={action}
        actorRound={actorRound}
        character={character}
        open={resolveDialogOpen}
        onClose={() => setResolveDialogOpen(false)}
      />
      <DeleteDialog
        message={`Are you sure you want to delete? This action cannot be undone.`}
        onDelete={handleDeleteAction}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </>
  );
};

export default ResolveActionCard;
