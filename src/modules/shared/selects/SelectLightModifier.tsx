import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { FormControl, FormLabel, ToggleButton, ToggleButtonGroup } from '@mui/material';

const SelectLightModifier: FC<{
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}> = ({ value, onChange, readOnly = false }) => {
  const { t } = useTranslation();
  const codes: string[] = ['none', 'helpful', 'required'];

  const handleClick = (option: string) => {
    if (readOnly) return;
    onChange(option);
  };

  return (
    <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
      <FormLabel id={'light-modifier'} component="legend" sx={{ mb: 1.5, typography: 'body1' }}>
        {t('light-modifier')}
      </FormLabel>
      <ToggleButtonGroup value={value} exclusive>
        {codes.map((option) => (
          <ToggleButton value={option} onClick={() => handleClick(option)} disabled={readOnly} sx={{ minWidth: 160 }}>
            {t(option)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </FormControl>
  );
};

export default SelectLightModifier;
