import React from 'react';

import IconButton from '@mui/material/IconButton';

import StyledIconButton from '../button/StyledIconButton';

const CircleButtonGroup = ({ options, initialRotation = 3.46, size = 50, radius = 32 }) => {

  const buttonCount = options.length;
  const angleStep = (2 * Math.PI) / buttonCount;

  const handleAction = (e) => {
    console.log("handleAction " + e);
  };

  if (!options) {
    return <p>Loading...</p>
  }

  return (
    <div className="circle-container">
      {options.map((option, index) => {
        const angle = (index * angleStep) + initialRotation;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        return (
          <StyledIconButton
            key={index}
            onClick={option.action}
            //onClick={handleAction}
            style={{
              position: 'absolute',
              top: `${y + radius}px`,
              left: `${x + radius}px`,
              width: `${size}px`,
              height: `${size}px`,
            }}
          >
            <img
              src={option.src}
              alt={option.alt}
              style={{ width: '100%', height: '100%', borderRadius: '50%' }}
            />
          </StyledIconButton>
        );
      })}
    </div>
  );
};

export default CircleButtonGroup;