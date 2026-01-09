import React, { FC } from 'react';
import Avatar from '@mui/material/Avatar';
import { ActorRound } from '../../api/actor-rounds.dto';

const ActorRoundAvatar: FC<{
  actorRound?: ActorRound;
  size?: number;
  dead?: boolean;
  variant?: 'circular' | 'rounded' | 'square';
}> = ({ actorRound, dead = false, variant = 'circular', size = 70 }) => {
  const resolveImage = (): string => {
    if (actorRound?.imageUrl) return actorRound.imageUrl;
    return '/static/images/races/unknown.png';
  };

  return (
    <Avatar
      src={resolveImage()}
      variant={variant}
      sx={{
        width: size,
        height: size,
        filter: dead ? 'grayscale(1)' : undefined,
      }}
    />
  );
};

export default ActorRoundAvatar;
