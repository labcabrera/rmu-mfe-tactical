import React, { FC } from 'react';
import { Stack, Button, FormControl, FormLabel } from '@mui/material';
import { t } from 'i18next';

const SelectMovementSkill: FC<{
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}> = ({ value, onChange, readOnly = false }) => {
  const labelId = 'select-movement-skill-label';

  const codes: string[] = ['running', 'swimming', 'climbing', 'flying'];

  const handleClick = (option: string) => {
    if (readOnly) return;
    onChange(option);
  };

  return (
    <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
      <FormLabel id={labelId} component="legend" sx={{ mb: 1, typography: 'body1' }}>
        {t('skill')}
      </FormLabel>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {codes.map((option) => {
          const selected = option === value;
          return (
            <Button
              key={option}
              size="large"
              variant={selected ? 'contained' : 'outlined'}
              color={selected ? 'primary' : 'inherit'}
              onClick={() => handleClick(option)}
              disabled={readOnly}
            >
              {t(option)}
            </Button>
          );
        })}
      </Stack>
    </FormControl>
  );
};

export default SelectMovementSkill;
