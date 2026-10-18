import React, { FC, KeyboardEvent } from 'react';
import { Box } from '@mui/material';
import { NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';

/**
 * A d100 roll field that reports the roll only when it is confirmed (blur or Enter) and differs from the stored one,
 * so the API is not called on every keystroke or on a blur without changes.
 */
const ConfirmedRollInput: FC<{
  label: string;
  /** The stored roll. */
  value: number | null | undefined;
  onConfirm: (roll: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  error?: boolean;
}> = ({ label, value, onConfirm, min = 1, max = 100, disabled, error }) => {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
      e.preventDefault();
      e.target.blur();
    }
  };

  const onChange = (roll: number | null) => {
    if (roll === null || roll === (value ?? null)) return;
    onConfirm(roll);
  };

  return (
    <Box onKeyDown={onKeyDown}>
      <NumericInput
        label={label}
        value={value ?? null}
        onChange={onChange}
        min={min}
        max={max}
        integer
        allowNegatives={false}
        disabled={disabled}
        error={error}
      />
    </Box>
  );
};

export default ConfirmedRollInput;
