/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

const SelectPace = ({ value, onChange }) => {
  const { t } = useTranslation();

  const codes = [
    { id: 'creep', multiplier: 1 / 8 },
    { id: 'walk', multiplier: 1 / 4 },
    { id: 'jog', multiplier: 1 / 2 },
    { id: 'run', multiplier: 3 / 4 },
    { id: 'sprint', multiplier: 1 },
    { id: 'dash', multiplier: 1.25 },
  ];

  const handleChange = (event) => {
    const value = event.target.value;
    const pace = codes.find((e) => e.id === value);
    onChange(value, pace);
  };

  return (
    <TextField select label={t('pace')} value={value} fullWidth onChange={handleChange} variant="standard">
      {codes.map((option, index) => (
        <MenuItem key={index} value={option.id}>
          {t(option.id)} (x{option.multiplier})
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectPace;
