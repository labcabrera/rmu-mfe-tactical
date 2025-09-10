import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Character } from '../api/characters';
import { TacticalGame } from '../api/tactical-games';
import CircleButtonGroup from '../shared/generic/CircleButtonGroup';

type Option = {
  src: string;
  alt: string;
  action: () => void;
};

type CombatFreeActionButtonsProps = {
  tacticalGame: TacticalGame;
  character: Character;
};

const CombatFreeActionButtons: FC<CombatFreeActionButtonsProps> = ({ tacticalGame, character }) => {
  const navigate = useNavigate();

  const options: Option[] = [
    {
      src: '/static/images/actions/drop-item.png',
      alt: 'Drop item',
      action: () => {
        navigate(`/tactical/combat/${tacticalGame.id}/drop-item`, {
          state: {
            tacticalGame: tacticalGame,
            character: character,
          },
        });
      },
    },
    {
      src: '/static/images/actions/perception.png',
      alt: 'Perception',
      action: () => {
        navigate(`/tactical/combat/${tacticalGame.id}/static-maneouver?skillId=perception`, {
          state: {
            tacticalGame: tacticalGame,
            character: character,
          },
        });
      },
    },
    {
      src: '/static/images/actions/cast-instant-spell.png',
      alt: 'Instant spell',
      action: () => {
        navigate(`/tactical/combat/${tacticalGame.id}/instant-spell?skillId=perception`, {
          state: {
            tacticalGame: tacticalGame,
            character: character,
          },
        });
      },
    },
  ];

  return <CircleButtonGroup options={options} initialRotation={2.6} size={60} radius={40} xOffset={10} yOffset={-40} />;
};

export default CombatFreeActionButtons;
