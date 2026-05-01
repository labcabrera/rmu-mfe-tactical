import React, { FC } from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

type GenericBarProps = {
  width?: number;
  max: number;
  current: number;
  colorOk?: string;
  colorKo?: string;
  borderColor?: string;
  backgroundColor?: string;
};

const GenericBar: FC<GenericBarProps> = ({
  width = 600,
  max,
  current,
  colorOk = '#4caf50',
  colorKo = '#ffeb3b',
  borderColor = '#5b6b6d',
  backgroundColor = '#656d64ff',
}) => {
  const healthPercentage = (current / max) * 100;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LinearProgress
          variant="determinate"
          value={healthPercentage}
          sx={{
            minWidth: width,
            width: '100%',
            height: 16,
            borderRadius: 0,
            border: `1px solid ${borderColor}`,
            backgroundColor: backgroundColor,
            '& .MuiLinearProgress-bar': {
              backgroundColor: healthPercentage > 50 ? colorOk : colorKo,
            },
          }}
        />
      </Box>

      <Box sx={{ minWidth: 50, ml: 1 }}>
        <Typography variant="caption" color="primary" sx={{ textAlign: 'right', fontWeight: 600 }}>
          {current} / {max}
        </Typography>
      </Box>
    </Box>
  );
};

export default GenericBar;
