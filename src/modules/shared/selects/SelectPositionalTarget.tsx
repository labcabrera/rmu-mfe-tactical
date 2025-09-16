import React, { ChangeEvent, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuItem, TextField } from '@mui/material';

const SelectPositionalTarget: FC<{
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  name?: string;
}> = ({ value, onChange, name = 'positionalTarget' }) => {
  const { t } = useTranslation();
  const options = ['none', 'flank', 'rear'];

  return (
    <TextField
      select
      label={t('positional-target')}
      name={name}
      value={value === undefined || value === null || options.length === 0 ? '' : value}
      variant="standard"
      fullWidth
      onChange={onChange}
    >
      {options.map((option, index) => (
        <MenuItem key={index} value={option}>
          {t(`positional-${option}`)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectPositionalTarget;
