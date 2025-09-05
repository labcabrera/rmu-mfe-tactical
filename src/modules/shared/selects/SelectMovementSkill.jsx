/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

const SelectMovementSkill = ({ value, onChange }) => {
  const { t } = useTranslation();

  const codes = ['running', 'swimming', 'climbing', 'flying'];

  const handleChange = (event) => {
    const value = event.target.value;
    const pace = codes.find((e) => e.id === value);
    onChange(value, pace);
  };

  return (
    <TextField select label={t('skill')} value={value} fullWidth onChange={handleChange} variant="standard">
      {codes.map((option, index) => (
        <MenuItem key={index} value={option}>
          {t(option)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectMovementSkill;
