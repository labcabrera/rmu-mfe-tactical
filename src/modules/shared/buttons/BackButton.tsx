import React, { FC, MouseEvent } from 'react';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import IconButton from '@mui/material/IconButton';

const BackButton: FC<{
  // eslint-disable-next-line no-unused-vars
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}> = ({ onClick, disabled = false }) => (
  <IconButton onClick={onClick} aria-label="add" disabled={disabled} size="large" color="primary">
    <KeyboardDoubleArrowLeftIcon fontSize="inherit" />
  </IconButton>
);

export default BackButton;
