import React, { FC } from 'react';
import { FormControl, ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material';
import { t } from 'i18next';

const SelectDodge: FC<{
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}> = ({ value, onChange, readOnly = false }) => {
  const options = ['none', 'passive', 'partial', 'full'];

  const handleClick = (optionId: string) => {
    if (readOnly) return;
    onChange(optionId);
  };

  return (
    <Tooltip title={t('dodge')}>
      <FormControl component="fieldset">
        <ToggleButtonGroup value={value} exclusive>
          {options.map((option) => (
            <ToggleButton
              key={option}
              value={option}
              onClick={() => handleClick(option)}
              disabled={readOnly}
              size="small"
              sx={{ minWidth: 140 }}
            >
              {t(`dodge-${option}`)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </FormControl>
    </Tooltip>
  );
};

export default SelectDodge;
