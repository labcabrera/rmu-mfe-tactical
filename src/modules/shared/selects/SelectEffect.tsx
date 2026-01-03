import React, { ChangeEvent, FC } from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

type SelectEffectProps = {
  value: string;
  name?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

const SelectEffect: FC<SelectEffectProps> = ({ value, name = 'effect', onChange }) => {
  const { t } = useTranslation();
  const options = ['death', 'bleeding', 'stunned', 'blinded', 'prone', 'surprised'];

  return (
    <TextField
      select
      label={t('effect')}
      name={name}
      value={value === undefined || value === null || options.length === 0 ? '' : value}
      fullWidth
      variant="standard"
      onChange={onChange}
    >
      {options.map((option, index) => (
        <MenuItem key={index} value={option}>
          {t(`effect-${option}`)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectEffect;
