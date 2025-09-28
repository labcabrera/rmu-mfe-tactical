import React, { FC } from 'react';
import { Faction } from '../../api/factions';
import { defaultFactionImage } from '../../services/image-service';
import CardListItem from './CardListItem';

const FactionCard: FC<{
  faction: Faction;
  disabled?: boolean;
  onClick?: () => void;
}> = ({ faction, disabled, onClick }) => {
  const getImage = () => {
    return faction.imageUrl ? faction.imageUrl : defaultFactionImage;
  };

  if (!faction) return <p>Loading...</p>;

  return <CardListItem title={faction.name} subtitle={faction.shortDescription} image={getImage()} onClick={onClick} disabled={disabled} />;
};

export default FactionCard;
