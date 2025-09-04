/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

const SelectStrategicGame = ({ value, onChange, strategicGames }) => {
  const { t } = useTranslation();

  const handleChange = (event) => {
    const value = event.target.value;
    const game = strategicGames.find((e) => e.id === value);
    onChange(value, game);
  };

  if (!strategicGames) {
    return <p>Loading...</p>;
  }

  return (
    <TextField
      select
      label={t('strategic-game')}
      value={value === undefined || value === null || strategicGames.length === 0 ? '' : value}
      fullWidth
      variant="standard"
      onChange={handleChange}
    >
      {strategicGames.map((option, index) => (
        <MenuItem key={index} value={option.id}>
          {option.name}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectStrategicGame;
