import React, { FC } from 'react';
import Avatar from '@mui/material/Avatar';
import { resolveAssetUrl } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActorRound } from '../../api/actor-rounds.dto';
import { imageBaseUrl } from '../../services/config';

const ActorRoundAvatar: FC<{
  actorRound?: ActorRound;
  size?: number;
  dead?: boolean;
  variant?: 'circular' | 'rounded' | 'square';
}> = ({ actorRound, dead = false, variant = 'circular', size = 70 }) => {
  const imageUrl = actorRound?.imageUrl
    ? resolveAssetUrl(actorRound.imageUrl)
    : `${imageBaseUrl}images/actions/select-actor-01.png`;

  return (
    <Avatar
      src={imageUrl}
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
