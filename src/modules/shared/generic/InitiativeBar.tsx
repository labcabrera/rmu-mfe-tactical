import React, { FC } from 'react';
import { Box, LinearProgress } from '@mui/material';

type InitiativeBarProps = {
  current: number;
  max?: number;
  width?: number | string;
  barColor?: string;
  backgroundColor?: string;
};

const InitiativeBar: FC<InitiativeBarProps> = ({
  current,
  max = 30,
  width = 240,
  barColor = '#617274',
  backgroundColor = 'rgb(28, 31, 34)',
}) => {
  const percentage = (current / max) * 100;

  return (
    <Box display="flex" alignItems="center" sx={{ gap: 1 }}>
      <Box sx={{ width: typeof width === 'number' ? `${width}px` : width, maxWidth: '100%' }}>
        <LinearProgress
          variant="determinate"
          value={Math.max(0, Math.min(100, percentage))}
          sx={{
            width: '100%',
            height: 16,
            borderRadius: 0,
            border: '1px solid #6e8688',
            backgroundColor: backgroundColor,
            '& .MuiLinearProgress-bar': {
              backgroundColor: barColor,
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default InitiativeBar;
