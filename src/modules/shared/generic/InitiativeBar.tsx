import React, { FC } from 'react';
import { Box, LinearProgress } from '@mui/material';

type InitiativeBarProps = {
  current: number;
  max?: number;
  width?: number;
  color?: string;
  backgroundColor?: string;
};

const InitiativeBar: FC<InitiativeBarProps> = ({
  current,
  max = 30,
  width = 140,
  color = '#253a4bff',
  backgroundColor = '#656d64ff',
}) => {
  const percentage = (current / max) * 100;

  return (
    <Box display="flex" alignItems="center" sx={{ gap: 1 }}>
      <Box sx={{ width: `${width}px` }}>
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 0,
            p: '4px',
            boxSizing: 'border-box',
          }}
        >
          <LinearProgress
            variant="determinate"
            value={Math.max(0, Math.min(100, percentage))}
            sx={{
              width: '100%',
              height: 12,
              borderRadius: 0,
              backgroundColor: backgroundColor,
              '& .MuiLinearProgress-bar': {
                backgroundColor: color,
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default InitiativeBar;
