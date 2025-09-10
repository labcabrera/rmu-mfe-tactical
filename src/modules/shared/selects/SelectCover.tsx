import React, { ChangeEvent, FC } from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

type SelectCoverProps = {
  value: string;
  name?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

const SelectCover: FC<SelectCoverProps> = ({ value, name = 'cover', onChange }) => {
  const { t } = useTranslation();
  const options = ['none', 'soft_partial', 'soft_half', 'soft_full', 'hard_partial', 'hard_half', 'hard_full'];

  return (
    <TextField
      select
      label={t('cover')}
      name={name}
      value={value === undefined || value === null || options.length === 0 ? '' : value}
      fullWidth
      variant="standard"
      onChange={onChange}
    >
      {options.map((option, index) => (
        <MenuItem key={index} value={option}>
          {t(`cover-${option}`)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectCover;
