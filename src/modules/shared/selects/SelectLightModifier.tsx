import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Button, Typography, FormControl, FormLabel } from '@mui/material';

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

export default SelectLightModifier;
