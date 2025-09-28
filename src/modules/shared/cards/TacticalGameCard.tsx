import React, { FC } from 'react';
import { t } from 'i18next';
import { TacticalGame } from '../../api/tactical-games';
import CardListItem from './CardListItem';

const TacticalGameCard: FC<{
  tacticalGame: TacticalGame;
  onClick?: () => void;
}> = ({ tacticalGame, onClick }) => {
  if (!tacticalGame) return <p>Loading...</p>;

  return (
    <CardListItem title={tacticalGame.name} subtitle={t(tacticalGame.descrtiption)} image="/static/images/generic/realm.png" onClick={onClick} />
  );
};

export default TacticalGameCard;
