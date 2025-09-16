import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

type DifficultyCode = {
  id: string;
  modifier: number;
};

const SelectDifficulty: FC<{
  value: string;
  onChange: (value: string, code?: DifficultyCode) => void;
}> = ({ value, onChange }) => {
  const { t } = useTranslation();

  const codes: DifficultyCode[] = [
    { id: 'c', modifier: 70 },
    { id: 's', modifier: 50 },
    { id: 'r', modifier: 30 },
    { id: 'e', modifier: 20 },
    { id: 'l', modifier: 10 },
    { id: 'm', modifier: 0 },
    { id: 'h', modifier: -10 },
    { id: 'vh', modifier: -20 },
    { id: 'xh', modifier: -30 },
    { id: 'sf', modifier: -50 },
    { id: 'a', modifier: -70 },
    { id: 'ni', modifier: -100 },
  ];

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const code = codes.find((e) => e.id === value);
    onChange(value, code);
  };

  return (
    <TextField select label={t('difficulty')} value={value} fullWidth onChange={handleChange} variant="standard">
      {codes.map((option, index) => (
        <MenuItem key={index} value={option.id}>
          {t(`difficulty-${option.id}`)} ({option.modifier >= 0 ? '+' : ''}
          {option.modifier})
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectDifficulty;
