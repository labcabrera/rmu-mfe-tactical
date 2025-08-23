import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { API_CORE_URL } from '../../../constants/environment';
import { VARIANT } from '../../../constants/ui';

const SelectAttackMode = ({ character, value, onChange }) => {
  const { t } = useTranslation();

  //TODO read options from character
  const options = ['mainHand', 'offHand', 'dual'];

  const [sizes, setSizes] = useState([]);

  const handleChange = (event) => {
    onChange(event.target.value);
  };

  useEffect(() => {
    const fetchSizes = async () => {
      const response = await fetch(`${API_CORE_URL}/character-sizes`);
      const responseBody = await response.json();
      setSizes(responseBody);
    };
    fetchSizes();
  }, []);

  return (
    <TextField
      select
      label={t('attack-mode')}
      value={value === undefined || value === null || sizes.length === 0 ? '' : value}
      variant={VARIANT}
      fullWidth
      onChange={handleChange}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Avatar src="/static/images/generic/select-weapon.png" sx={{ width: 25, height: 25 }} />
            </InputAdornment>
          ),
        },
      }}
    >
      {options.map((option, index) => (
        <MenuItem key={index} value={option}>
          {t(option)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectAttackMode;
