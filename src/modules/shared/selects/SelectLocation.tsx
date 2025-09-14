import React, { ChangeEvent, FC } from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

type SelectDodgeProps = {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  label?: string;
};

const SelectLocation: FC<SelectDodgeProps> = ({ value, onChange, name = 'location', label = 'Location' }) => {
  const { t } = useTranslation();
  const options = ['none', 'head', 'body', 'arms', 'legs'];

  return (
    <TextField
      select
      label={label}
      name={name}
      value={value === undefined || value === null || options.length === 0 ? '' : value}
      variant="standard"
      fullWidth
      onChange={onChange}
    >
      {options.map((option, index) => (
        <MenuItem key={index} value={option}>
          {t(`${option}`)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectLocation;
