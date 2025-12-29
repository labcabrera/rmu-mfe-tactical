import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Button, Typography, FormControl, FormLabel } from '@mui/material';
import { t } from 'i18next';

export type Pace = {
  id: string;
  multiplier: number;
};

const SelectPace: FC<{
  value: string;
  onChange: (value: string, pace?: Pace) => void;
  readOnly?: boolean;
}> = ({ value, onChange, readOnly = false }) => {
  const labelId = 'select-pace-label';

  const codes: Pace[] = [
    { id: 'creep', multiplier: 1 / 8 },
    { id: 'walk', multiplier: 1 / 4 },
    { id: 'jog', multiplier: 1 / 2 },
    { id: 'run', multiplier: 3 / 4 },
    { id: 'sprint', multiplier: 1 },
    { id: 'dash', multiplier: 1.25 },
  ];

  const handleClick = (option: Pace) => {
    if (readOnly) return;
    onChange(option.id, option);
  };

  return (
    <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
      <FormLabel id={labelId} component="legend" sx={{ mb: 2, typography: 'body1' }}>
        {t('pace')}
      </FormLabel>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {codes.map((option) => {
          const selected = option.id === value;
          return (
            <Button
              key={option.id}
              size="small"
              variant={selected ? 'contained' : 'outlined'}
              color={selected ? 'primary' : 'inherit'}
              onClick={() => handleClick(option)}
              disabled={readOnly}
            >
              {t(option.id)}
            </Button>
          );
        })}
      </Stack>
    </FormControl>
  );
};

export default SelectPace;
