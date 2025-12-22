import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Button, Typography } from '@mui/material';

export type Pace = {
  id: string;
  multiplier: number;
};

const SelectPace: FC<{
  value: string;
  onChange: (value: string, pace?: Pace) => void;
  readOnly?: boolean;
}> = ({ value, onChange, readOnly = false }) => {
  const { t } = useTranslation();

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
    <div>
      <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
        {t('pace')}
      </Typography>
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
    </div>
  );
};

export default SelectPace;
