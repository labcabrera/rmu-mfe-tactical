import React from 'react';
import { useNavigate } from "react-router-dom";


import CircleButtonGroup from '../shared/CircleButtonGroup';

const CombatPhaseActionButtons = ({ tacticalGame, character, characters, phaseNumber }) => {

  const navigate = useNavigate();

  const options = [
    {
      src: '/static/images/actions/movement.png',
      alt: 'Movement',
      action: () => {
        navigate(`/tactical/combat/${tacticalGame.id}/declare-movement?phaseStart=${phaseNumber}`, {
          state: { tacticalGame: tacticalGame, character: character }
        });
        return;
      }
    },
    {
      src: '/static/images/actions/attack.png',
      alt: 'Declare attack',
      action: () => {
        navigate(`/tactical/combat/${tacticalGame.id}/declare-attack?phaseStart=${phaseNumber}`, {
          state: {
            tacticalGame: tacticalGame, character: character, characters: characters
          }
        });
        return;
      }
    },
    {
      src: '/static/images/actions/movement-maneuver.png',
      alt: 'Movement maneuver',
      action: () => {
        navigate(`/tactical/combat/${tacticalGame.id}/declare-movement-maneuver?phaseStart=${phaseNumber}`, {
          state: {
            tacticalGame: tacticalGame, character: character
          }
        });
        return;
      }
    },
    {
      src: '/static/images/actions/static-maneuver.png',
      alt: 'Static maneuver',
      action: () => {
        navigate(`/tactical/combat/${tacticalGame.id}/declare-static-maneuver?phaseStart=${phaseNumber}`, {
          state: {
            tacticalGame: tacticalGame, character: character
          }
        });
        return;
      }
    },
    {
      src: '/static/images/actions/cast-spell.png',
      alt: 'Cast spell',
      action: () => {
        navigate(`/tactical/combat/${tacticalGame.id}/cast-spell?phaseStart=${phaseNumber}`, {
          state: {
            tacticalGame: tacticalGame, character: character
          }
        });
        return;
      }
    }
  ];

  if (!tacticalGame || !character || !phaseNumber) {
    return <p>Loading...</p>
  }

  return (
    <CircleButtonGroup options={options} initialRotation={3.46} size={70} radius={48} />
  );

};

export default CombatPhaseActionButtons;