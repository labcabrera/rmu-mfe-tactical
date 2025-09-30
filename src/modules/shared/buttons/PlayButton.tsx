import React, { FC } from 'react';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import { IconButton } from '@mui/material';

const PlayButton: FC<{
  onClick?: () => void;
  disabled?: boolean;
}> = ({ onClick, disabled = false }) => {
  return (
    <IconButton onClick={onClick} aria-label="add" disabled={disabled} size="large" color="primary">
      <PlayCircleIcon fontSize="inherit" />
    </IconButton>
  );
};

export default PlayButton;
