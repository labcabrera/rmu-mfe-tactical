/* eslint-disable react/prop-types */
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { deleteAction } from '../api/actions';
import DeleteButton from '../shared/buttons/DeleteButton';
import PlayButton from '../shared/buttons/PlayButton';
import CircleButtonGroup from '../shared/generic/CircleButtonGroup';
import { CombatContext } from './CombatProvider';

const ResolveActionCard = ({ character, action }) => {
  const navigate = useNavigate();
  const { roundActions, setRoundActions } = useContext(CombatContext);
  const { game } = useContext(CombatContext);

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
      action: () => {
        handleResolve();
        return;
      },
    },
    {
      src: '/static/images/generic/delete.png',
      alt: 'Delete action',
      action: () => {
        handleDelete();
        return;
      },
    },
  ];

  return (
    <CircleButtonGroup options={options} initialRotation={4.71} size={60} radius={40} xOffset={-70} yOffset={-110} />
    // <Stack direction="row">
    //   <IconButton
    //     disabled
    //     style={{
    //       width: `70px`,
    //       height: `70px`,
    //       opacity: 0.5,
    //     }}
    //   >
    //     <img
    //       src={`/static/images/actions/${action.actionType}.png`}
    //       alt={action.actionType}
    //       style={{ width: '100%', height: '100%', borderRadius: '50%' }}
    //     />
    //   </IconButton>
    //   <PlayButton onClick={handleResolveActionClick} size={70} />
    //   <DeleteButton onClick={() => handleDeleteActionClick()} size={70} />
    // </Stack>
  );
};

export default ResolveActionCard;
