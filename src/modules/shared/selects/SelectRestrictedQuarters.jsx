import React from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

const SelectRestrictedQuarters = ({ value, onChange, name = 'restrictedQuarters' }) => {
  const { t } = useTranslation();
  const options = ['none', 'close', 'cramped', 'tight', 'confined'];

  return (
    <TextField
      select
      label={t('restricted-quarters')}
      name={name}
      value={value === undefined || value === null || options.length === 0 ? '' : value}
      variant="standard"
      fullWidth
      onChange={onChange}
    >
      {options.map((option, index) => (
        <MenuItem key={index} value={option}>
          {t(`restricted-quarter-${option}`)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectRestrictedQuarters;
