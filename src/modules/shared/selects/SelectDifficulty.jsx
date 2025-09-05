/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

const SelectDifficulty = ({ value, onChange }) => {
  const { t } = useTranslation();

  const codes = [
    { id: 'c', modifier: 70 },
    { id: 's', modifier: 50 },
    { id: 'r', modifier: 30 },
    { id: 'e', modifier: 20 },
    { id: 'l', modifier: 10 },
    { id: 'm', modifier: 0 },
    { id: 'h', modifier: -10 },
    { id: 'vh', modifier: -20 },
    { id: 'xh', modifier: -30 },
    { id: 'sf', modifier: -50 },
    { id: 'a', modifier: -70 },
    { id: 'ni', modifier: -100 },
  ];

  const handleChange = (event) => {
    const value = event.target.value;
    const pace = codes.find((e) => e.id === value);
    onChange(value, pace);
  };

  return (
    <TextField select label={t('difficulty')} value={value} fullWidth onChange={handleChange} variant="standard">
      {codes.map((option, index) => (
        <MenuItem key={index} value={option.id}>
          {t(`difficulty-${option.id}`)} ({option.modifier >= 0 ? '+' : ''} {option.modifier})
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectDifficulty;
