import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Button, Typography } from '@mui/material';

type DifficultyCode = {
  id: string;
  modifier: number;
};

const SelectDifficulty: FC<{
  value: string;
  onChange: (value: string, code?: DifficultyCode) => void;
  readOnly?: boolean;
}> = ({ value, onChange, readOnly = false }) => {
  const { t } = useTranslation();

  const codes: DifficultyCode[] = [
    { id: 'c', modifier: 70 },
    { id: 's', modifier: 50 },
    { id: 'r', modifier: 30 },
    { id: 'e', modifier: 20 },
    { id: 'l', modifier: 10 },
    { id: 'm', modifier: 0 },
    { id: 'h', modifier: -10 },
    { id: 'vh', modifier: -20 },
    { id: 'xh', modifier: -30 },
    { id: 'sf', modifier: -50 },
    { id: 'a', modifier: -70 },
    { id: 'ni', modifier: -100 },
  ];

  const handleClick = (option: DifficultyCode) => {
    if (readOnly) return;
    onChange(option.id, option);
  };

  return (
    <div>
      <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
        {t('difficulty')}
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
              {`${option.id}`} {`(${option.modifier >= 0 ? '+' : ''}${option.modifier})`}
            </Button>
          );
        })}
      </Stack>
    </div>
  );
};

export default SelectDifficulty;
