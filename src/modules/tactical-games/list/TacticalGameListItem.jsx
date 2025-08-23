import React from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

const TacticalGameListItem = ({ tacticalGame }) => {
  const navigate = useNavigate();

  const handleGameClick = () => {
    navigate(`/tactical/games/view/${tacticalGame.id}`, { state: { tacticalGame: tacticalGame } });
  };

  if (!tacticalGame) {
    return <p>Loading...</p>;
  }

  const getSubtitle = () => {
    return tacticalGame.round > 0 ? `Round ${tacticalGame.round}` : 'Not started';
  };

  return (
    <div>
      <ListItemButton onClick={handleGameClick}>
        <ListItemAvatar>
          <Avatar src="/static/images/characters/lotr-witch-king.jpg" />
        </ListItemAvatar>
        <ListItemText primary={tacticalGame.name} secondary={getSubtitle()} />
      </ListItemButton>
    </div>
  );
};

export default TacticalGameListItem;
