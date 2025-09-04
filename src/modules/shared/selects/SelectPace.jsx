/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

const SelectPace = ({ value, onChange }) => {
  const { t } = useTranslation();

  const paces = [
    { id: 'creep', multiplier: 1 / 8 },
    { id: 'walk', multiplier: 1 / 4 },
    { id: 'jog', multiplier: 1 / 2 },
    { id: 'run', multiplier: 3 / 4 },
    { id: 'sprint', multiplier: 1 },
    { id: 'dash', multiplier: 1.25 },
  ];

  const handleChange = (event) => {
    const value = event.target.value;
    const pace = paces.find((e) => e.id === value);
    onChange(value, pace);
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="select-pace-label">{t('pace')}</InputLabel>
      <Select
        id="select-pace"
        labelId="select-pace-label"
        label={t('pace')}
        variant="standard"
        value={value === undefined || value === null || paces.length === 0 ? '' : value}
        onChange={handleChange}
      >
        {paces.map((option, index) => (
          <MenuItem key={index} value={option.id}>
            {t(option.id)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectPace;
