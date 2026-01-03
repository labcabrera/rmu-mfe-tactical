import React, { FC } from 'react';
import { Avatar, Chip } from '@mui/material';
import { t } from 'i18next';

const Effect: FC<{
  effect: string;
  rounds?: number | undefined;
  value?: number | undefined;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}> = ({ effect: status, rounds, value, color = 'info' }) => {
  const getLabel = () => {
    let label = '';
    switch (status) {
      case 'dmg':
        break;
      default:
        label = t(`effect-${status}`);
        break;
    }
    if (value) {
      label += ` ${value}`;
    }
    if (rounds) {
      label += rounds > 1 ? ` (${rounds} rounds)` : ` (1 round)`;
    }
    return label;
  };

  return (
    <Chip
      avatar={<Avatar alt={getLabel()} src={`/static/images/icons/${status}.png`} />}
      label={getLabel()}
      color={color}
    />
  );
};

export default Effect;
