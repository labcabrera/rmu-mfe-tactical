import React, { FC } from 'react';
import { FormControl, FormLabel, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { t } from 'i18next';

const SelectDodge: FC<{
  value: string;
  onChange: (value: string) => void;
  name?: string;
  readOnly?: boolean;
}> = ({ value, onChange, name = 'dodge', readOnly = false }) => {
  const labelId = `select-dodge-${name}-label`;

  const options = ['none', 'passive', 'partial', 'full'];

  const handleClick = (optionId: string) => {
    if (readOnly) return;
    onChange(optionId);
  };

  return (
    <FormControl component="fieldset">
      <FormLabel id={labelId} component="legend" sx={{ mb: 1, typography: 'body1' }}>
        {t('dodge')}
      </FormLabel>
      <ToggleButtonGroup value={value} exclusive>
        {options.map((option) => (
          <ToggleButton value={option} onClick={() => handleClick(option)} disabled={readOnly} sx={{ minWidth: 140 }}>
            {t(`dodge-${option}`)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </FormControl>
  );
};

export default SelectDodge;
