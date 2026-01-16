import React, { FC } from 'react';
import { Button, Tooltip } from '@mui/material';
import { t } from 'i18next';

const names = {
  movement: 'M',
  free_movement: 'FM',
  melee_attack: 'ME',
  ranged_attack: 'RA',
  other: '+',
};

const ActionIconButton: FC<{
  actionType: 'movement' | 'free_movement' | 'melee_attack' | 'ranged_attack' | 'other';
  onClick?: () => void;
  disabled?: boolean;
}> = ({ actionType, onClick, disabled = false }) => {
  return (
    <Tooltip title={t(actionType)}>
      <Button onClick={onClick} disabled={disabled}>
        {names[actionType]}
      </Button>
    </Tooltip>
  );
};

export default ActionIconButton;
