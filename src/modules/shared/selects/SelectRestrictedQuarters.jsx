/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { VARIANT } from '../../../constants/ui';

const SelectRestrictedQuarters = ({ value, onChange }) => {
  const { t } = useTranslation();

  const restrictedQuartersOptions = [
    { id: 'none', bonus: 0 },
    { id: 'close', bonus: -25 },
    { id: 'cramped', bonus: -50 },
    { id: 'tigth', bonus: -75 },
    { id: 'confined', bonus: -100 },
  ];

  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <TextField
      select
      label={t('restricted-quarters')}
      value={value === undefined || value === null || restrictedQuartersOptions.length === 0 ? '' : value}
      variant={VARIANT}
      fullWidth
      onChange={handleChange}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Avatar src="/static/images/generic/restricted-quarters.png" sx={{ width: 25, height: 25 }} />
            </InputAdornment>
          ),
        },
      }}
    >
      {restrictedQuartersOptions.map((option, index) => (
        <MenuItem key={index} value={option.id}>
          {t(`restricted-quarter-${option.id}`)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectRestrictedQuarters;
