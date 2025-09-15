import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Chip } from '@mui/material';

const Effect: FC<{ effect: string; rounds?: number | undefined; value?: number | undefined }> = ({ effect: status, rounds, value }) => {
  const { t } = useTranslation();

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

  return <Chip avatar={<Avatar alt={getLabel()} src={`/static/images/icons/${status}.png`} />} label={getLabel()} />;
};

export default Effect;
