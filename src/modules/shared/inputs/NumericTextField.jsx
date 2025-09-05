/* eslint-disable react/prop-types */
import React from 'react';
import TextField from '@mui/material/TextField';

const NumericTextField = ({ value, onChange, ...props }) => {
  const handleChange = (e) => {
    const val = e.target.value;
    if (/^-?\d*\.?\d*$/.test(val) || val === '-') {
      onChange(val);
    }
  };

  return (
    <TextField
      {...props}
      value={value}
      onChange={handleChange}
      slotProps={{
        input: {
          inputMode: 'decimal',
          pattern: '^-?\\d*\\.?\\d*$',
        },
      }}
    />
  );
};

export default NumericTextField;
