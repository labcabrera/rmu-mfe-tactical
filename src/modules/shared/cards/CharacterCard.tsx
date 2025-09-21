import React, { FC } from 'react';
import { t } from 'i18next';
import { Character } from '../../api/characters';
import { resolveRaceImage } from '../../services/race-avatar-service';
import CardListItem from './CardListItem';

const CharacterCard: FC<{
  character: Character;
  disabled?: boolean;
  onClick?: () => void;
}> = ({ character, disabled, onClick }) => {
  if (!character) return <p>Loading...</p>;

  return (
    <CardListItem
      title={character.name}
      subtitle={`${character.info.raceName} - ${t(character.info.professionId)} - ${character.experience.availableLevel}`}
      image={resolveRaceImage(character.info.raceName)}
      onClick={onClick}
      disabled={disabled}
    />
  );
};

export default CharacterCard;
