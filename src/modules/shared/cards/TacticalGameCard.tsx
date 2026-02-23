import React, { FC } from 'react';
import { t } from 'i18next';
import { TacticalGame } from '../../api/tactical-game';
import CardListItem from './CardListItem';

const imageBaseUrl = process.env.RMU_MFE_ASSETS!;

const TacticalGameCard: FC<{
  tacticalGame: TacticalGame;
  onClick?: () => void;
}> = ({ tacticalGame, onClick }) => {
  if (!tacticalGame) return <p>Loading...</p>;

  return (
    <CardListItem
      title={tacticalGame.name}
      subtitle={t(tacticalGame.descrtiption)}
      image={`${imageBaseUrl}images/generic/realm.png`}
      onClick={onClick}
    />
  );
};

export default TacticalGameCard;
