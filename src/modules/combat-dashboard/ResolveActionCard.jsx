import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { deleteAction } from '../api/actions';
import DeleteButton from '../shared/buttons/DeleteButton';
import PlayButton from '../shared/buttons/PlayButton';
import { CombatContext } from './CombatProvider';

const ResolveActionCard = ({ character, action }) => {
  const navigate = useNavigate();
  const { roundActions, setRoundActions } = useContext(CombatContext);
  const { game } = useContext(CombatContext);
  const { characters } = useContext(CombatContext);

  const handleDeleteActionClick = async () => {
    try {
      await deleteAction(action.id);
      const newActionList = roundActions.filter((e) => e.id !== action.id);
      setRoundActions(newActionList);
    } catch (error) {
      console.log('delete error: ' + error);
    }
  };

  const handleResolveActionClick = async () => {
    navigate(`/tactical/combat/${action.gameId}/resolve-attack/${action.id}`, { state: { game, character, characters } });
    return;
  };

  if (!action || !character || !game) {
    return <p>Loading...</p>;
  }

  return (
    <Stack direction="row">
      <IconButton
        disabled
        style={{
          width: `70px`,
          height: `70px`,
          opacity: 0.5,
        }}
      >
        <img
          src={`/static/images/actions/${action.actionType}.png`}
          alt={action.actionType}
          style={{ width: '100%', height: '100%', borderRadius: '50%' }}
        />
      </IconButton>
      <PlayButton onClick={handleResolveActionClick} size={70} />
      <DeleteButton onClick={() => handleDeleteActionClick()} size={70} />
    </Stack>
  );
};

export default ResolveActionCard;
