import React, { FC } from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

// Colors are theme palette paths (`info.dark`) or CSS colors.
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
  colorOk = 'success.main',
  colorKo = 'warning.main',
  borderColor = 'divider',
  backgroundColor = 'action.disabledBackground',
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
            border: 1,
            borderColor,
            backgroundColor,
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
