import React, { ChangeEvent, FC } from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';

type NumericTextFieldProps = Omit<TextFieldProps, 'onChange' | 'value'> & {
  value: string | number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  maxDecimals?: number;
};

const NumericTextField: FC<NumericTextFieldProps> = ({ value, onChange, maxDecimals = 0, ...props }) => {
  const decimalPattern = maxDecimals && maxDecimals > 0 ? `^-?\\d*\\.?\\d{0,${maxDecimals}}$` : '^-?\\d*$';

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (new RegExp(decimalPattern).test(val) || val === '-') {
      onChange(e);
    }
  };

  return (
    <TextField
      {...props}
      value={value}
      onChange={handleChange}
      variant="standard"
      fullWidth
      slotProps={{
        input: {
          inputMode: maxDecimals && maxDecimals > 0 ? 'decimal' : 'numeric',
          // pattern: decimalPattern,
        },
      }}
    />
  );
};

export default NumericTextField;
