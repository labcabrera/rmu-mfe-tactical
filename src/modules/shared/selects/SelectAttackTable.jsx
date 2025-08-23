import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { API_ATTACK_TABLES_URL } from '../../../constants/environment';
import { VARIANT } from '../../../constants/ui';

const SelectAttackTable = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [attackTables, setAttackTables] = useState([]);

  const handleChange = (event) => {
    onChange(event.target.value);
  };

  useEffect(() => {
    const fetchAttackTables = async () => {
      const response = await fetch(`${API_ATTACK_TABLES_URL}/attack-tables`);
      const responseBody = await response.json();
      setAttackTables(responseBody);
    };
    fetchAttackTables();
  }, []);

  return (
    <TextField
      select
      label={t('attack-table')}
      value={value === undefined || value === null || attackTables.length === 0 ? '' : value}
      variant={VARIANT}
      fullWidth
      onChange={handleChange}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Avatar src="/static/images/generic/attack-table.png" sx={{ width: 25, height: 25 }} />
            </InputAdornment>
          ),
        },
      }}
    >
      {attackTables.map((option, index) => (
        <MenuItem key={index} value={option}>
          {t(option)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectAttackTable;
