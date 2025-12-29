import React, { FC } from 'react';
import { Button } from '@mui/material';

type ToggleButtonProps = {
  label: string;
  value: boolean;
  onChange?: (newValue: boolean) => void;
  readOnly?: boolean;
  size?: 'small' | 'medium' | 'large';
};

const ToggleButton: FC<ToggleButtonProps> = ({ label, value, onChange, readOnly = false, size = 'large' }) => {
  const handleClick = () => {
    if (readOnly || !onChange) return;
    onChange(!value);
  };

  return (
    <Button
      size={size}
      variant={value ? 'contained' : 'outlined'}
      color={value ? 'primary' : 'inherit'}
      onClick={handleClick}
      disabled={readOnly}
    >
      {label}
    </Button>
  );
};

export default ToggleButton;
