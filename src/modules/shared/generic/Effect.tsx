import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Chip, Tooltip } from '@mui/material';
import { resolveAssetUrl } from '@labcabrera-rmu/rmu-react-shared-lib';

/** An effect or damage chip. `image` (an icon path in the assets) is optional and not used for now. */
const Effect: FC<{
  label: string;
  status: string;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  image?: string;
}> = ({ label, status, color = 'default', image }) => {
  const { t } = useTranslation();
  return (
    <Tooltip title={t(status)}>
      <Chip
        avatar={
          image ? (
            <Avatar variant="rounded" alt={label} src={resolveAssetUrl(image)} sx={{ borderRadius: '4px' }} />
          ) : undefined
        }
        label={label}
        color={color}
      />
    </Tooltip>
  );
};

export default Effect;
