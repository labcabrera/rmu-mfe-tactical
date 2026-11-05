import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuItem, TextField } from '@mui/material';
import { formatBonus } from '@labcabrera-rmu/rmu-react-shared-lib';
import { DIFFICULTY_TABLE } from '../../api/action.dto';

/** Difficulty of a maneuver (Table 5-2) as a compact select, with its modifier. */
const DifficultySelect: FC<{
  value: string;
  onChange: (difficulty: string) => void;
  disabled?: boolean;
  minWidth?: number;
}> = ({ value, onChange, disabled, minWidth = 180 }) => {
  const { t } = useTranslation();
  return (
    <TextField
      select
      size="small"
      label={t('difficulty')}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      sx={{ minWidth }}
    >
      {DIFFICULTY_TABLE.map((option) => (
        <MenuItem key={option.key} value={option.key}>
          {`${t(`difficulty-${option.key}`)} ${formatBonus(option.value)}`}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default DifficultySelect;
