import React from 'react';
import IconButton from '@mui/material/IconButton';

const DeleteButton = ({ onClick, size = 80 }) => {
  return (
    <IconButton
      onClick={onClick}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <img src="/static/images/generic/delete.png" alt="Delete" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
    </IconButton>
  );
};

export default DeleteButton;
