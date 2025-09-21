import React from 'react';
import Avatar from '@mui/material/Avatar';
import { TacticalGame } from '../../api/tactical-games';

const TacticalGameAvatar: React.FC<{
  tacticalGame: TacticalGame;
  size?: number;
}> = ({ tacticalGame, size = 70 }) => {
  const defaultImage = '/static/images/avatars/sauron.png';

  const resolveImage = (game: TacticalGame) => {
    if (game.imageUrl) return game.imageUrl;
    return defaultImage;
  };

  return <Avatar src={resolveImage(tacticalGame)} sx={{ width: size, height: size }} />;
};

export default TacticalGameAvatar;
