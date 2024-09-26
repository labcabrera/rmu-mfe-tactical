import React from 'react';
import IconButton from '@mui/material/IconButton';

const CombatPhaseActionButtons = ({}) => {

  const radius = 45;
  const buttonCount = 5;
  const angleStep = (2 * Math.PI) / buttonCount;

  const images = [
    { src: '/static/images/actions/movement.jpg', alt: 'Botón 1' },
    { src: '/static/images/actions/attack.png', alt: 'Botón 2' },
    { src: '/static/images/actions/movement-maneuver.webp', alt: 'Botón 3' },
    { src: '/static/images/actions/static-maneuver.png', alt: 'Botón 4' },
    { src: '/static/images/actions/spell.png', alt: 'Botón 5' },
  ];

  return (
    <div className="circle-container">
      {images.map((image, index) => {
        const angle = (index * angleStep) + 3.46;
        const x = radius * Math.cos(angle); // position X
        const y = radius * Math.sin(angle); // position Y

        return (
          <IconButton
            key={index}
            style={{
              position: 'absolute',
              top: `${y + radius}px`,
              left: `${x + radius}px`,
              width: '60px',
              height: '60px',
            }}
          >
            <img
              src={image.src}
              alt={image.alt}
              style={{ width: '100%', height: '100%', borderRadius: '50%' }} // Imagen redonda
            />
          </IconButton>
        );
      })}
    </div>
  );
};

export default CombatPhaseActionButtons;