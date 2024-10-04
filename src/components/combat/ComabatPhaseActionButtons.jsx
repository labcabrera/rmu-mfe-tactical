import React from 'react';
import { useNavigate } from "react-router-dom";

import IconButton from '@mui/material/IconButton';

const CombatPhaseActionButtons = ({ tacticalGame, character, characters, phaseNumber }) => {

  const navigate = useNavigate();

  const radius = 45;
  const buttonCount = 5;
  const angleStep = (2 * Math.PI) / buttonCount;

  const actions = [
    { src: '/static/images/actions/movement.jpg', alt: 'Movement', type: "movement" },
    { src: '/static/images/actions/attack.png', alt: 'Botón 2', type: "attack" },
    { src: '/static/images/actions/movement-maneuver.webp', alt: 'Botón 3', type: "movement-maneuver" },
    { src: '/static/images/actions/static-maneuver.png', alt: 'Botón 4', type: "static-maneuver" },
    { src: '/static/images/actions/spell.png', alt: 'Botón 5', type: "spell" },
  ];

  const handleClick = (type) => {
    console.log("CombatPhaseActionButtons.handleClick " + type);
    switch (type) {
      case 'attack':
        navigate(`/tactical/combat/${tacticalGame.id}/declare-attack?phaseStart=${phaseNumber}`, {
          state: { tacticalGame: tacticalGame, character: character, characters: characters
          }
        });
        return;
      case 'movement':
        navigate(`/tactical/combat/${tacticalGame.id}/declare-movement?phaseStart=${phaseNumber}`, {
          state: { tacticalGame: tacticalGame, character: character }
        });
        return;
    }
  };

  if (!tacticalGame || !character || !phaseNumber) {
    return <p>Loading...</p>
  }

  return (
    <div className="circle-container">
      {actions.map((action, index) => {
        const angle = (index * angleStep) + 3.46; // initial rotation
        const x = radius * Math.cos(angle); // position X
        const y = radius * Math.sin(angle); // position Y

        return (
          <IconButton
            key={index}
            onClick={() => handleClick(action.type)}
            style={{
              position: 'absolute',
              top: `${y + radius}px`,
              left: `${x + radius}px`,
              width: '60px',
              height: '60px',
            }}
          >
            <img
              src={action.src}
              alt={action.alt}
              style={{ width: '100%', height: '100%', borderRadius: '50%' }} // Rounded image
            />
          </IconButton>
        );
      })}
    </div>
  );
};

export default CombatPhaseActionButtons;