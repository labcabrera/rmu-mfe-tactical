import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, FormControl, FormLabel, ButtonGroup, ToggleButtonGroup, ToggleButton } from '@mui/material';

const SelectBoolean: FC<{
  id: string;
  name: string;
  value?: boolean | null;
  onChange: (value: boolean) => void;
  readOnly?: boolean;
}> = ({ id = 'select-boolean', name, value = null, onChange, readOnly = false }) => {
  const { t } = useTranslation();

  const options: { id: boolean; label: string }[] = [
    { id: true, label: t('Required') },
    { id: false, label: t('Automatic') },
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
            <ToggleButton
              value={opt.id}
              key={String(opt.id)}
              onClick={() => handleClick(opt.id)}
              disabled={readOnly}
              sx={{ minWidth: 140 }}
            >
              {opt.label}
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>
    </FormControl>
  );
};

export default SelectBoolean;
