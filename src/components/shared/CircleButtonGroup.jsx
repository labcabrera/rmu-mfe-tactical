import React from 'react';

import { Box } from '@mui/material';

import StyledIconButton from '../button/StyledIconButton';

const Circle = ({ x, y, radius, lineWidth, color }) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: y,
        left: x,
        width: radius * 2,
        height: radius * 2,
        borderRadius: '50%',
        border: `${lineWidth}px solid ${color}`,
        backgroundColor: '#1e1e1e',
        zIndex: -100
      }}
    />
  );
};

const CircleButtonGroup = ({ options, initialRotation = 3.46, size = 50, radius = 32, xOffset = 0, yOffset = 0 }) => {

  const buttonCount = options.length;
  const angleStep = (2 * Math.PI) / buttonCount;

  const handleAction = (e) => {
    console.log("handleAction " + e);
  };

  if (!options) {
    return <p>Loading...</p>
  }

  return (
    <Box
      sx={{
        position: 'relative'
      }}>
      <Circle x={0+xOffset} y={radius} radius={radius + 35} lineWidth={2} color="#9d9d9d" />
      <div className="circle-container">
        {options.map((option, index) => {
          const angle = (index * angleStep) + initialRotation;
          const x = radius * Math.cos(angle) + xOffset;
          const y = radius * Math.sin(angle) + yOffset + radius;

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
    </Box>
  );
};

export default CircleButtonGroup;