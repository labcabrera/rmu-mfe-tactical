/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

const SelectSizeAdjustment = ({ value, onChange, disabled = false }) => {
  const { t } = useTranslation();

  const values = [-1, 0, 1];

  const handleLevelChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <TextField
      select
      label={t('size-adjustment')}
      id="select-size-adjustment"
      value={value === undefined || value === null || values.length === 0 ? '' : value}
      disabled={disabled}
      fullWidth
      onChange={handleLevelChange}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Avatar src="/static/images/generic/size.png" sx={{ width: 25, height: 25 }} />
            </InputAdornment>
          ),
        },
      }}
    >
      {values.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectSizeAdjustment;
