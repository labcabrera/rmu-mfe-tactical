/* eslint-disable react/prop-types */
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteAction } from '../api/actions';
import DeleteDialog from '../shared/dialogs/DeleteDialog';
import CircleButtonGroup from '../shared/generic/CircleButtonGroup';
import { CombatContext } from './../../CombatContext';

const ResolveActionCard = ({ character, action }) => {
  const navigate = useNavigate();
  const { roundActions, setRoundActions } = useContext(CombatContext);
  const { game } = useContext(CombatContext);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteAction(action.id);
      const newActionList = roundActions.filter((e) => e.id != action.id);
      console.log('New action list: ' + JSON.stringify(newActionList));
      setRoundActions(newActionList);
    } catch (error) {
      console.log('delete error: ' + error);
    }
  };

  const handleResolve = async () => {
    navigate(`/tactical/combat/${action.gameId}/resolve/movement/${action.id}`, { state: { action } });
    return;
  };

  if (!action || !character || !game) {
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
      <CircleButtonGroup options={options} initialRotation={4.71} size={60} radius={40} xOffset={-70} yOffset={-110} />
      <DeleteDialog
        message={`Are you sure you want to delete? This action cannot be undone.`}
        onDelete={() => handleDelete()}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </>
  );
};

export default ResolveActionCard;
