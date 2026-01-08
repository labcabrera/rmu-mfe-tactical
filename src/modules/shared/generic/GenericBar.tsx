import React, { FC } from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

type GenericBarProps = {
  title: string;
  width?: number;
  max: number;
  current: number;
  colorOk?: string;
  colorKo?: string;
  backgroundColor?: string;
};

const GenericBar: FC<GenericBarProps> = ({
  width = 140,
  max,
  current,
  colorOk = '#4caf50',
  colorKo = '#ffeb3b',
  backgroundColor = '#656d64ff',
}) => {
  const healthPercentage = (current / max) * 100;

  return (
    <Box display="flex" alignItems="center" sx={{ gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            border: '2px solid',
            borderColor: 'divider',
            borderRadius: 0,
            p: '3px',
            boxSizing: 'border-box',
          }}
        >
          <LinearProgress
            variant="determinate"
            value={healthPercentage}
            sx={{
              minWidth: width,
              width: '100%',
              height: 12,
              borderRadius: 0,
              backgroundColor: backgroundColor,
              '& .MuiLinearProgress-bar': {
                backgroundColor: healthPercentage > 50 ? colorOk : colorKo,
              },
            }}
          />
        </Box>

        <Box sx={{ minWidth: 50, ml: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>
            {current} / {max}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default GenericBar;
