import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuItem, TextField } from '@mui/material';

type Pace = {
  id: string;
  multiplier: number;
};

const SelectPace: FC<{
  name?: string;
  value: string;
  onChange: (value: string, pace?: Pace) => void;
}> = ({ name, value, onChange }) => {
  const { t } = useTranslation();

  const codes: Pace[] = [
    { id: 'creep', multiplier: 1 / 8 },
    { id: 'walk', multiplier: 1 / 4 },
    { id: 'jog', multiplier: 1 / 2 },
    { id: 'run', multiplier: 3 / 4 },
    { id: 'sprint', multiplier: 1 },
    { id: 'dash', multiplier: 1.25 },
  ];

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const pace = codes.find((e) => e.id === value);
    onChange(value, pace);
  };

  return (
    <TextField select label={t('pace')} name={name} value={value} fullWidth onChange={handleChange} variant="standard">
      {codes.map((option, index) => (
        <MenuItem key={index} value={option.id}>
          {t(option.id)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectPace;
