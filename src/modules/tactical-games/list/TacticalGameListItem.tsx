import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, ListItemAvatar, ListItemButton, ListItemText } from '@mui/material';
import type { TacticalGame } from '../../api/tactical-games';

type TacticalGameListItemProps = {
  tacticalGame: TacticalGame;
};

const TacticalGameListItem: FC<TacticalGameListItemProps> = ({ tacticalGame }) => {
  const navigate = useNavigate();

  const handleGameClick = () => {
    navigate(`/tactical/games/view/${tacticalGame.id}`, { state: { tacticalGame } });
  };

  if (!tacticalGame) {
    return <p>Loading...</p>;
  }

  const getSubtitle = () => {
    return tacticalGame.round > 0 ? `Round ${tacticalGame.round}` : 'Not started';
  };

  return (
    <ListItemButton onClick={handleGameClick}>
      <ListItemAvatar>
        <Avatar src="/static/images/characters/lotr-witch-king.jpg" />
      </ListItemAvatar>
      <ListItemText primary={tacticalGame.name} secondary={getSubtitle()} />
    </ListItemButton>
  );
};

export default TacticalGameListItem;
