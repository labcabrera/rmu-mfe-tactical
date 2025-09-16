import React, { ChangeEvent, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuItem, TextField } from '@mui/material';

const SelectPositionalSource: FC<{
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  name?: string;
}> = ({ value, onChange, name = 'positionalSource' }) => {
  const { t } = useTranslation();
  const options = ['none', 'to_flank', 'to_rear'];

  return (
    <TextField
      select
      label={t('positional-source')}
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

export default SelectPositionalSource;
