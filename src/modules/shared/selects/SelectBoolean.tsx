import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { FormControl, FormLabel, ToggleButtonGroup, ToggleButton } from '@mui/material';

const SelectBoolean: FC<{
  id: string;
  name: string;
  value?: boolean | null;
  onChange: (value: boolean) => void;
  readOnly?: boolean;
}> = ({ id = 'select-boolean', name, value = null, onChange, readOnly = false }) => {
  const { t } = useTranslation();

  const options: { id: boolean; label: string }[] = [
    { id: true, label: t('Yes') },
    { id: false, label: t('No') },
  ];

  const handleClick = (val: boolean) => {
    if (readOnly) return;
    onChange(val);
  };

  return (
    <FormControl component="fieldset">
      <FormLabel id={id} component="legend" sx={{ mb: 1, typography: 'body1' }}>
        {name}
      </FormLabel>
      <ToggleButtonGroup color="standard" value={value} exclusive>
        {options.map((opt) => {
          return (
            <ToggleButton value={opt.id} onClick={() => handleClick(opt.id)} disabled={readOnly} sx={{ minWidth: 140 }}>
              {opt.label}
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>
    </FormControl>
  );
};

export default SelectBoolean;
