import React from 'react';
import { useTranslation } from 'react-i18next';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

const SelectWeaponSkill = ({ value, onChange }) => {
  const { t } = useTranslation();

  //TODO read from api
  const availableTables = [
    'melee-weapon@blade',
    'melee-weapon@chain',
    'melee-weapon@exotic',
    'melee-weapon@greater-blade',
    'melee-weapon@greater-chain',
    'melee-weapon@greater-hafted',
    'melee-weapon@hafted',
    'melee-weapon@pole-arm',
    'ranged-weapon@bow',
    'ranged-weapon@crossbow',
    'ranged-weapon@exotic',
    'ranged-weapon@sling',
    'ranged-weapon@thrown',
  ];

  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <TextField
      select
      label={t('weapon-skill')}
      value={value === undefined || value === null || availableTables.length === 0 ? '' : value}
      fullWidth
      onChange={handleChange}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Avatar src="/static/images/generic/attack-table.png" sx={{ width: 25, height: 25 }} />
            </InputAdornment>
          ),
        },
      }}
    >
      {availableTables.map((option, index) => (
        <MenuItem key={index} value={option}>
          {t(option)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectWeaponSkill;
