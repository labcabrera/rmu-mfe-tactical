import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Chip, Tooltip } from '@mui/material';
import { imageBaseUrl } from '@labcabrera-rmu/rmu-react-shared-lib';

const Effect: FC<{
  label: string;
  status: string;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}> = ({ label, status, color = 'default' }) => {
  const { t } = useTranslation();
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
