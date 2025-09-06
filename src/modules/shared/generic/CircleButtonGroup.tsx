import React from 'react';
import { Box } from '@mui/material';
import StyledIconButton from '../buttons/StyledIconButton';

type Option = {
  src: string;
  alt: string;
  action?: () => void;
};

type CircleProps = {
  x: number;
  y: number;
  radius: number;
  lineWidth: number;
  backgroundColor?: string;
  color: string;
};

const Circle: React.FC<CircleProps> = ({ x, y, radius, lineWidth, backgroundColor, color }) => {
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
        backgroundColor: backgroundColor,
        zIndex: -100,
      }}
    />
  );
};

type CircleButtonGroupProps = {
  options: Option[];
  initialRotation?: number;
  size?: number;
  radius?: number;
  xOffset?: number;
  yOffset?: number;
  backgroundColor?: string;
};

const CircleButtonGroup: React.FC<CircleButtonGroupProps> = ({
  options,
  initialRotation = 3.46,
  size = 50,
  radius = 32,
  xOffset = 0,
  yOffset = 0,
  backgroundColor = undefined,
}) => {
  const buttonCount = options.length;
  const angleStep = (2 * Math.PI) / buttonCount;

  if (!options) {
    return <p>Loading...</p>;
  }

  return (
    <Box
      sx={{
        position: 'relative',
      }}
    >
      <Circle x={0 + xOffset} y={radius + yOffset} radius={radius + 30} lineWidth={2} color="#5e5e5eff" backgroundColor={backgroundColor} />
      <div className="circle-container">
        {options.map((option, index) => {
          const angle = index * angleStep + initialRotation;
          const x = radius * Math.cos(angle) + xOffset;
          const y = radius * Math.sin(angle) + yOffset + radius;

          return (
            <StyledIconButton
              key={index}
              onClick={option.action}
              style={{
                position: 'absolute',
                top: `${y + radius}px`,
                left: `${x + radius}px`,
                width: `${size}px`,
                height: `${size}px`,
              }}
            >
              <img src={option.src} alt={option.alt} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
            </StyledIconButton>
          );
        })}
      </div>
    </Box>
  );
};

export default CircleButtonGroup;
