import React, { FC, useContext, useState } from 'react';
import { CombatContext } from '../../CombatContext';
import { useError } from '../../ErrorContext';
import { deleteAction } from '../api/action';
import { Action } from '../api/action.dto';
import { ActorRound } from '../api/actor-rounds.dto';
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

  const onDelete = async () => {
    deleteAction(action.id)
      .then(() => {
        const newActionList = roundActions.filter((e: Action) => e.id !== action.id);
        setRoundActions(newActionList);
      })
      .catch((err) => showError(err.message));
  };

  if (!action || !actorRound || !game) return <p>Loading...</p>;

  const options = [
    {
      src: `/static/images/actions/${action.actionType}.png`,
      alt: 'Icon action',
    },
    {
      src: '/static/images/generic/play.png',
      alt: 'Resolve',
      action: () => setResolveDialogOpen(true),
    },
    {
      src: '/static/images/generic/delete.png',
      alt: 'Delete action',
      action: () => setDeleteDialogOpen(true),
    },
  ];

  return (
    <>
      <CircleButtonGroup
        options={options}
        initialRotation={4.71}
        size={60}
        radius={40}
        xOffset={-70}
        yOffset={-110}
        backgroundColor="#212121"
      />
      <ResolveActionDialog
        action={action}
        actorRound={actorRound}
        character={character}
        open={resolveDialogOpen}
        onClose={() => setResolveDialogOpen(false)}
      />
      <DeleteDialog
        message={`Are you sure you want to delete? This action cannot be undone.`}
        onDelete={onDelete}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </>
  );
};

export default ResolveActionCard;
