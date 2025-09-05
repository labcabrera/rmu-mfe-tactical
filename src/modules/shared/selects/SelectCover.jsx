/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

const SelectCover = ({ value, name = 'cover', onChange }) => {
  const { t } = useTranslation();
  const options = ['none', 'partial-light', 'half-light', 'full-light', 'partial-hard', 'half-hard', 'full-hard'];

  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <TextField
      select
      label={t('cover')}
      name={name}
      value={value === undefined || value === null || options.length === 0 ? '' : value}
      fullWidth
      variant="standard"
      onChange={handleChange}
    >
      {options.map((option, index) => (
        <MenuItem key={index} value={option}>
          {t(`cover-${option}`)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectCover;
