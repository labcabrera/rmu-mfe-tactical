import React, { FC } from 'react';
import { Avatar, Chip } from '@mui/material';

const Effect: FC<{
  label: string;
  status: string | undefined;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}> = ({ label, status, color = 'default' }) => {
  return (
    <Chip avatar={<Avatar alt={label} src={`/static/images/icons/${status}.png`} />} label={label} color={color} />
  );
};

export default Effect;
