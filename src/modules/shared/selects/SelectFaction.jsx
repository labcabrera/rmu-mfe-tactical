/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { VARIANT } from '../../../constants/ui';

const SelectFaction = ({ factions, value, onChange }) => {
  const { t } = useTranslation();

  const handleFactionChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <TextField
      select
      label={t('faction')}
      value={value === undefined || value === null || factions.length === 0 ? '' : value}
      variant={VARIANT}
      required
      fullWidth
      onChange={handleFactionChange}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Avatar src="/static/images/generic/faction.png" sx={{ width: 25, height: 25 }} />
            </InputAdornment>
          ),
        },
      }}
    >
      {factions.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectFaction;
