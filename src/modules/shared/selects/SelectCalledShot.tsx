import React, { ChangeEvent, FC } from 'react';
import { FormControl, FormLabel, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { t } from 'i18next';

type SelectCalledShotProps = {
  value?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  label?: string;
  readOnly?: boolean;
};

const SelectCalledShot: FC<SelectCalledShotProps> = ({
  value = 'none',
  onChange,
  name = 'calledShot',
  label = 'Called Shot',
  readOnly = false,
}) => {
  const options = ['none', 'head', 'body', 'arms', 'legs'];

  const handleClick = (option: string) => {
    if (readOnly) return;
    const evt = { target: { name, value: option } } as unknown as ChangeEvent<HTMLInputElement>;
    onChange(evt);
  };

  const labelId = `select-called-shot-${name}-label`;

  return (
    <FormControl component="fieldset">
      <FormLabel id={labelId} component="legend" sx={{ mb: 1, typography: 'body1' }}>
        {t(label)}
      </FormLabel>
      <ToggleButtonGroup value={value} exclusive>
        {options.map((option) => (
          <ToggleButton value={option} onClick={() => handleClick(option)} disabled={readOnly} sx={{ minWidth: 140 }}>
            {t(option)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </FormControl>
  );
};

export default SelectCalledShot;
