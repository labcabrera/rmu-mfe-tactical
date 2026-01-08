import React, { FC } from 'react';
import { FormControl, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { t } from 'i18next';

const SelectManeuverType: FC<{
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}> = ({ value, onChange, readOnly = false }) => {
  const options: string[] = ['absolute', 'percent'];

  const handleClick = (option: string) => {
    if (readOnly) return;
    onChange(option);
  };

  return (
    <FormControl component="fieldset">
      <ToggleButtonGroup color="primary" value={value} exclusive>
        {options.map((option) => (
          <ToggleButton
            value={option}
            onClick={() => handleClick(option)}
            disabled={readOnly}
            size="small"
            sx={{ minWidth: 100 }}
          >
            {t(option)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </FormControl>
  );
};

export default SelectManeuverType;
