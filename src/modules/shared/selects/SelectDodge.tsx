import React, { FC } from 'react';
import { Stack, Button, FormControl, FormLabel } from '@mui/material';
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
    <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
      <FormLabel id={labelId} component="legend" sx={{ mb: 1, typography: 'body1' }}>
        {t('dodge')}
      </FormLabel>
      <Stack role="group" aria-labelledby={labelId} direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {options.map((option) => {
          const selected = option === value || (!value && option === 'none');
          return (
            <Button
              key={option}
              size="large"
              variant={selected ? 'contained' : 'outlined'}
              color={selected ? 'primary' : 'inherit'}
              onClick={() => handleClick(option)}
              disabled={readOnly}
            >
              {t(`dodge-${option}`)}
            </Button>
          );
        })}
      </Stack>
    </FormControl>
  );
};

export default SelectDodge;
