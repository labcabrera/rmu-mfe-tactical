import React, { ChangeEvent, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuItem, TextField } from '@mui/material';
import { StrategicGame } from '../../api/strategic-games';

const SelectStrategicGame: FC<{
  value: string;
  onChange: (value: string) => void;
  strategicGames: StrategicGame[];
}> = ({ value, onChange, strategicGames }) => {
  const { t } = useTranslation();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedValue = event.target.value;
    onChange(selectedValue);
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
