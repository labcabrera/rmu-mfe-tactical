import React, { FC } from 'react';
import { Stack, Button, Typography, Badge } from '@mui/material';
import { t } from 'i18next';

type DifficultyCode = {
  id: string;
  code: string;
  modifier: number;
};

const SelectDifficulty: FC<{
  value: string;
  onChange: (value: string, code?: DifficultyCode) => void;
  readOnly?: boolean;
}> = ({ value, onChange, readOnly = false }) => {
  const codes: DifficultyCode[] = [
    { id: 'casual', code: 'c', modifier: 70 },
    { id: 'simple', code: 's', modifier: 50 },
    { id: 'routine', code: 'r', modifier: 30 },
    { id: 'easy', code: 'e', modifier: 20 },
    { id: 'light', code: 'l', modifier: 10 },
    { id: 'medium', code: 'm', modifier: 0 },
    { id: 'hard', code: 'h', modifier: -10 },
    { id: 'very_hard', code: 'vh', modifier: -20 },
    { id: 'extremely_hard', code: 'xh', modifier: -30 },
    { id: 'sheer_folly', code: 'sf', modifier: -50 },
    { id: 'absurd', code: 'a', modifier: -70 },
    { id: 'nigh_impossible', code: 'ni', modifier: -100 },
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
      <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
        {codes.map((option) => {
          const selected = option.id === value;
          return (
            <Badge
              badgeContent={option.modifier > 0 ? `+${option.modifier}` : option.modifier}
              color={option.modifier >= 0 ? 'success' : 'error'}
              key={option.id}
            >
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
            </Badge>
          );
        })}
      </Stack>
    </div>
  );
};

export default SelectDifficulty;
