import React, { FC } from 'react';
import Avatar from '@mui/material/Avatar';
import type { Character } from '../../api/characters';

type CharacterAvatarProps = {
  character: Character;
  size?: number;
  variant?: 'circular' | 'rounded' | 'square';
};

const CharacterAvatar: FC<CharacterAvatarProps> = ({ character, variant = 'circular', size = 70 }) => {
  const defaultImage = '/static/images/races/unknown.png';

  const resolveImage = (): string => {
    if (!character || !character.info || !character.info.raceId) {
      return defaultImage;
    }
    const check = character.info.raceId.toLowerCase();
    if (check.includes('orc')) return '/static/images/races/generic-orc-01.png';
    if (check.includes('human')) return '/static/images/races/generic-human-01.png';
    if (check.includes('troll')) return '/static/images/races/generic-troll-01.png';
    if (check.includes('dwarf')) return '/static/images/races/generic-dwarf-01.png';
    if (check.includes('elf')) return '/static/images/races/generic-elf-01.png';
    return defaultImage;
  };

  return <Avatar src={resolveImage()} variant={variant} sx={{ width: size, height: size }} />;
};

export default CharacterAvatar;
