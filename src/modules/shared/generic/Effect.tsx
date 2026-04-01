import React, { FC } from 'react';
import { Avatar, Chip, Tooltip } from '@mui/material';
import { t } from 'i18next';
import { imageBaseUrl } from '../../services/config';

const Effect: FC<{
  label: string;
  status: string;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}> = ({ label, status, color = 'default' }) => {
  return (
    <Tooltip title={t(status)}>
      <Chip
        avatar={<Avatar alt={label} src={`${imageBaseUrl}images/icons/${status}.png`} />}
        label={label}
        color={color}
      />
    </Tooltip>
  );
};

export default Effect;
