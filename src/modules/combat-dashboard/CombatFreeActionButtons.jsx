/* eslint-disable react/prop-types */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CircleButtonGroup from '../shared/generic/CircleButtonGroup';

const CombatFreeActionButtons = ({ tacticalGame, character }) => {
  const navigate = useNavigate();

  const options = [
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
        return;
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
        return;
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
        return;
      },
    },
  ];

  return <CircleButtonGroup options={options} initialRotation={2.6} size={60} radius={40} xOffset={0} yOffset={-10} />;
};

export default CombatFreeActionButtons;
