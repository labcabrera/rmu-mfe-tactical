import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

type ChargeSpeedOption = {
  id: string;
  size: number;
};

const SelectChargeSpeed: FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const { t } = useTranslation();

  const restrictedQuartersOptions: ChargeSpeedOption[] = [
    { id: 'none', size: 0 },
    { id: 'jog', size: 1 },
    { id: 'sprint', size: 2 },
  ];

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <TextField
      select
      label={t('charge-speed')}
      value={value === undefined || value === null || restrictedQuartersOptions.length === 0 ? '' : value}
      variant="standard"
      fullWidth
      onChange={handleChange}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Avatar src="/static/images/generic/charge-speed.png" sx={{ width: 25, height: 25 }} />
            </InputAdornment>
          ),
        },
      }}
    >
      {restrictedQuartersOptions.map((option, index) => (
        <MenuItem key={index} value={option.id}>
          {t(`charge-speed-${option.id}`)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectChargeSpeed;
