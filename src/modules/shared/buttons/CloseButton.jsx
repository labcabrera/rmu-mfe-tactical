/* eslint-disable react/prop-types */
import React from 'react';
import IconButton from '@mui/material/IconButton';

const CloseButton = ({ onClick, size = 80 }) => {
  return (
    <IconButton
      onClick={onClick}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <img src="/static/images/generic/door.png" alt="Add" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
    </IconButton>
  );
};

export default CloseButton;
