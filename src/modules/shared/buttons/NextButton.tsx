import React, { FC, MouseEvent } from 'react';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import IconButton from '@mui/material/IconButton';

const NextButton: FC<{
  // eslint-disable-next-line no-unused-vars
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}> = ({ onClick, disabled = false }) => (
  <IconButton onClick={onClick} aria-label="add" disabled={disabled} size="large" color="primary">
    <KeyboardDoubleArrowRightIcon fontSize="inherit" />
  </IconButton>
);

export default NextButton;
