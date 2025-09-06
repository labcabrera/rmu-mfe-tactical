/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

const SelectPositionalSource = ({ value, onChange, name = 'positionalSource' }) => {
  const { t } = useTranslation();
  const options = ['none', 'flank', 'rear'];

  return (
    <TextField
      select
      label={t('positional-source')}
      name={name}
      value={value === undefined || value === null || options.length === 0 ? '' : value}
      variant="standard"
      fullWidth
      onChange={onChange}
    >
      {options.map((option, index) => (
        <MenuItem key={index} value={option}>
          {t(`positional-${option}`)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectPositionalSource;
