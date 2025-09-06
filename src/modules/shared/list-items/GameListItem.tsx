import React from 'react';
import { useNavigate } from 'react-router-dom';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { TacticalGame } from '../../api/tactical-games';
import GameAvatar from '../avatars/GameAvatar';

type GameListItemProps = {
  game: TacticalGame;
};

const GameListItem: React.FC<GameListItemProps> = ({ game }) => {
  const navigate = useNavigate();

  const handleGameClick = () => {
    navigate(`/tactical/games/view/${game.id}`, { state: { game } });
  };

  return (
    <ListItemButton onClick={handleGameClick}>
      <ListItemAvatar sx={{ mr: 2 }}>
        <GameAvatar game={game} />
      </ListItemAvatar>
      <ListItemText primary={game.name} secondary={game.description} />
    </ListItemButton>
  );
};

export default GameListItem;
