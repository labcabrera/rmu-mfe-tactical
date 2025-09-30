import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

const CloseButton = ({ onClick }) => {
  return (
    <IconButton onClick={onClick} aria-label="close" size="large" color="primary">
      <CloseIcon fontSize="inherit" />
    </IconButton>
  );
};

export default CloseButton;
