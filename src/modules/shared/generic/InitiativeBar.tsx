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
  barColor = 'secondary.main',
  backgroundColor = 'action.disabledBackground',
}) => {
  const percentage = (current / max) * 100;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ width: typeof width === 'number' ? `${width}px` : width, maxWidth: '100%' }}>
        <LinearProgress
          variant="determinate"
          value={Math.max(0, Math.min(100, percentage))}
          sx={{
            width: '100%',
            height: 16,
            borderRadius: 0,
            border: 1,
            borderColor: 'divider',
            backgroundColor,
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
