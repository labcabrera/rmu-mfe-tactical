import React, { FC } from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';

const ActionIconButton: FC<{
  tooltipTitle?: string;
  onClick?: () => void;
  disabled?: boolean;
  imageSrc: string;
  size?: number;
}> = ({ tooltipTitle, onClick, disabled = false, imageSrc, size = 60 }) => {
  return (
    <Tooltip title={tooltipTitle}>
      <IconButton onClick={onClick} disabled={disabled} sx={{ p: 0 }}>
        <Box sx={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
          <Box
            component="img"
            src={imageSrc}
            sx={{ width: '100%', height: '100%', display: 'block', borderRadius: 1 }}
            alt={tooltipTitle || ''}
          />
          {disabled && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                borderRadius: 1,
                pointerEvents: 'none',
                bgcolor: 'rgba(0,0,0,0.7)',
              }}
            />
          )}
        </Box>
      </IconButton>
    </Tooltip>
  );
};

export default ActionIconButton;
