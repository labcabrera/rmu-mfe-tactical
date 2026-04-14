import React, { FC } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { t } from 'i18next';
import { StrategicGame } from '../../api/strategic-games';

const SelectStrategicGame: FC<{
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  strategicGames: StrategicGame[];
}> = ({ value, onChange, strategicGames }) => {
  if (!strategicGames) {
    return <p>Loading...</p>;
  }

  const selectedOption = strategicGames.find((s) => s.id === value) ?? null;

  return (
    <Autocomplete
      options={strategicGames}
      getOptionLabel={(option) => option.name || ''}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      value={selectedOption}
      onChange={(_event, newValue) => onChange(newValue ? newValue.id : null)}
      fullWidth
      renderInput={(params) => <TextField {...params} label={t('Strategic game')} error={!value} />}
    />
  );
};

export default SelectStrategicGame;
