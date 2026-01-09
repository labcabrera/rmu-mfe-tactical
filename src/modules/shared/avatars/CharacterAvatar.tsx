import React, { FC } from 'react';
import Avatar from '@mui/material/Avatar';
import { Character } from '../../api/characters.dto';
import { resolveRaceImage } from '../../services/race-avatar-service';

type CharacterAvatarProps = {
  character: Character;
  size?: number;
  dead?: boolean;
  variant?: 'circular' | 'rounded' | 'square';
};

const CharacterAvatar: FC<CharacterAvatarProps> = ({ character, dead = false, variant = 'circular', size = 70 }) => {
  const defaultImage = '/static/images/races/unknown.png';

  const resolveImage = (): string => {
    if (character && character.imageUrl) return character.imageUrl;
    if (!character || !character.info || !character.info.raceName) {
      return defaultImage;
    }
    return resolveRaceImage(character.info.raceName);
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

export default CharacterAvatar;
