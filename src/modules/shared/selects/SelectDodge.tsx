import React, { ChangeEvent, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuItem, TextField } from '@mui/material';

const SelectDodge: FC<{
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  name?: string;
}> = ({ value, onChange, name = 'dodge' }) => {
  const { t } = useTranslation();
  const options = ['none', 'passive', 'partial', 'full'];

  return (
    <TextField
      select
      label={t('dodge')}
      name={name}
      value={value === undefined || value === null || options.length === 0 ? '' : value}
      variant="standard"
      fullWidth
      onChange={onChange}
    >
      {options.map((option, index) => (
        <MenuItem key={index} value={option}>
          {t(`dodge-${option}`)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectDodge;
