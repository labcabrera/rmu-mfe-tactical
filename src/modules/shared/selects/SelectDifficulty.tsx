import React, { FC } from 'react';
import { Badge, FormControl, FormLabel, ToggleButtonGroup, ToggleButton } from '@mui/material';
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

  const badgeContent = (modifier: number) => {
    if (readOnly) return null;
    if (modifier === 0) return '+0';
    return modifier > 0 ? `+${modifier}` : modifier;
  };

  const badgeColor = (modifier: number): 'success' | 'error' | 'secondary' => {
    if (modifier === 0) return 'secondary';
    return modifier > 0 ? 'success' : 'error';
  };

  return (
    <FormControl component="fieldset">
      <FormLabel id={'difficulty'} component="legend" sx={{ mb: 2, typography: 'body1' }}>
        {t('difficulty')}
      </FormLabel>
      <ToggleButtonGroup color="primary" value={value} exclusive>
        {codes.map((option) => {
          return (
            <Badge badgeContent={badgeContent(option.modifier)} color={badgeColor(option.modifier)} key={option.id}>
              <ToggleButton
                value={option.id}
                size="large"
                onClick={() => handleClick(option)}
                disabled={readOnly}
                sx={{ minWidth: 80 }}
              >
                {t(option.code)}
              </ToggleButton>
            </Badge>
          );
        })}
      </ToggleButtonGroup>
    </FormControl>
  );
};

export default SelectDifficulty;
