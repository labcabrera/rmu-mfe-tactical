import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Autocomplete, TextField } from '@mui/material';
import { StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';

const SelectStrategicGame: FC<{
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  strategicGames: StrategicGame[];
}> = ({ value, onChange, strategicGames }) => {
  const { t } = useTranslation();

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
      renderInput={(params) => <TextField {...params} label={t('strategic-game')} error={!value} />}
    />
  );
};

export default SelectStrategicGame;
