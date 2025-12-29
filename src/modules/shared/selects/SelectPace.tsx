import React, { FC } from 'react';
import { Stack, Button, FormControl, FormLabel, Badge } from '@mui/material';
import { t } from 'i18next';

export type Pace = {
  id: string;
  multiplier: number;
  bonus: number | undefined;
};

const SelectPace: FC<{
  value: string;
  onChange: (value: string, pace?: Pace) => void;
  readOnly?: boolean;
  combatOptions?: boolean;
}> = ({ value, onChange, readOnly = false, combatOptions = false }) => {
  const labelId = 'select-pace-label';

  const codes: Pace[] = [
    { id: 'creep', multiplier: 1 / 8, bonus: 0 },
    { id: 'walk', multiplier: 1 / 4, bonus: -25 },
    { id: 'jog', multiplier: 1 / 2, bonus: -50 },
    { id: 'run', multiplier: 3 / 4, bonus: -75 },
    { id: 'sprint', multiplier: 1, bonus: undefined },
    { id: 'dash', multiplier: 1.25, bonus: undefined },
  ];

  const optionsToShow = combatOptions ? codes.slice(0, 4) : codes;

  const handleClick = (option: Pace) => {
    if (readOnly) return;
    onChange(option.id, option);
  };

  const badgeContent = (option: Pace): string | undefined => {
    if (option.bonus === undefined) return undefined;
    if (option.bonus === 0) return '+0';
    return `${option.bonus}`;
  };

  const badgeColor = (option: Pace): 'error' | 'secondary' => {
    if (option.bonus === undefined) return 'secondary';
    return option.bonus < 0 ? 'error' : 'secondary';
  };

  return (
    <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
      <FormLabel id={labelId} component="legend" sx={{ mb: 1, typography: 'body1' }}>
        {t('pace')}
      </FormLabel>
      <Stack direction="row" spacing={combatOptions ? 3 : 1} sx={{ flexWrap: 'wrap' }}>
        {optionsToShow.map((option) => {
          const selected = option.id === value;
          return (
            <Badge key={option.id} badgeContent={badgeContent(option)} color={badgeColor(option)}>
              <Button
                key={option.id}
                size="large"
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
    </FormControl>
  );
};

export default SelectPace;
