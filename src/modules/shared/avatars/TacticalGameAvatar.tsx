import React from 'react';
import Avatar from '@mui/material/Avatar';
import { TacticalGame } from '../../api/tactical-game.dto';

const imageBaseUrl = process.env.RMU_MFE_ASSETS!;
const defaultImage = `${imageBaseUrl}images/avatars/avatar-017.png`;

const TacticalGameAvatar: React.FC<{
  tacticalGame: TacticalGame;
  size?: number;
}> = ({ tacticalGame, size = 70 }) => {
  return (
    <Avatar src={tacticalGame.imageUrl ? tacticalGame.imageUrl : defaultImage} sx={{ width: size, height: size }} />
  );
};

export default TacticalGameAvatar;
