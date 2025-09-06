import React from 'react';
import Avatar from '@mui/material/Avatar';
import { TacticalGame } from '../../api/tactical-games';

type GameAvatarProps = {
  game: TacticalGame;
  size?: number;
};

const GameAvatar: React.FC<GameAvatarProps> = ({ game, size = 70 }) => {
  const defaultImage = '/static/images/avatars/sauron.png';

  const resolveImage = (game: TacticalGame) => {
    if (game.imageUrl) return game.imageUrl;
    return defaultImage;
  };

  return <Avatar src={resolveImage(game)} sx={{ width: size, height: size }} />;
};

export default GameAvatar;
