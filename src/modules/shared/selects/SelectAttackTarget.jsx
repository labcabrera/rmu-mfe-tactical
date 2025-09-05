/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

const SelectAttackTarget = ({ value, onChange, sourceId, includeSource = false, targets, i18nLabel = 'target' }) => {
  const { t } = useTranslation();

  const handleChange = (event) => {
    const targetId = event.target.value;
    onChange(targetId);
  };

  if (!targets) {
    return <p>Loading...</p>;
  }

  return (
    <TextField
      select
      id="select-attack-target"
      label={t(i18nLabel)}
      fullWidth
      value={value === undefined || value === null || targets.length === 0 ? '' : value}
      variant="standard"
      onChange={handleChange}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Avatar src="/static/images/generic/shield.png" sx={{ width: 25, height: 25 }} />
            </InputAdornment>
          ),
        },
      }}
    >
      {targets
        .filter((e) => e.id != sourceId || includeSource)
        .map((option, index) => (
          <MenuItem key={index} value={option.id}>
            {option.name}
          </MenuItem>
        ))}
    </TextField>
  );
};

export default SelectAttackTarget;
