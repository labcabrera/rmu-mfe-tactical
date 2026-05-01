import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { FormControl, ToggleButtonGroup, ToggleButton } from '@mui/material';

export default function SelectManeuverType({
  value,
  onChange,
  readOnly = false,
}: {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}) {
  const { t } = useTranslation();
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
}
