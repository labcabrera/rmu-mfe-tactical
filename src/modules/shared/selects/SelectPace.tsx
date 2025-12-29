import React, { FC } from 'react';
import { Button, FormControl, FormLabel, Badge, ButtonGroup, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { t } from 'i18next';

export type Pace = {
  id: string;
  multiplier: number;
  bonus: number | undefined;
  label: string;
};

const SelectPace: FC<{
  value: string;
  onChange: (value: string, pace?: Pace) => void;
  readOnly?: boolean;
  combatOptions?: boolean;
}> = ({ value, onChange, readOnly = false, combatOptions = false }) => {
  const labelId = 'select-pace-label';

  const codes: Pace[] = [
    { id: 'creep', multiplier: 1 / 8, bonus: 0, label: 'x1/2' },
    { id: 'walk', multiplier: 1 / 4, bonus: -25, label: 'x1' },
    { id: 'jog', multiplier: 1 / 2, bonus: -50, label: 'x2' },
    { id: 'run', multiplier: 3 / 4, bonus: -75, label: 'x3' },
    { id: 'sprint', multiplier: 1, bonus: undefined, label: 'x4' },
    { id: 'dash', multiplier: 1.25, bonus: undefined, label: 'x5' },
  ];

  const optionsToShow = combatOptions ? codes.slice(0, 4) : codes;

  const handleClick = (option: Pace) => {
    if (readOnly) return;
    onChange(option.id, option);
  };

  const badgeContent = (option: Pace): string | undefined => {
    if (!combatOptions) return option.label;
    if (!combatOptions || option.bonus === undefined) return undefined;
    if (option.bonus === 0) return '+0';
    return `${option.bonus}`;
  };

  const badgeColor = (option: Pace): 'error' | 'secondary' => {
    if (!combatOptions || option.bonus === undefined) return 'secondary';
    return option.bonus < 0 ? 'error' : 'secondary';
  };

  return (
    <FormControl component="fieldset">
      <FormLabel id={labelId} component="legend" sx={{ mb: 1, typography: 'body1' }}>
        {t('pace')}
      </FormLabel>
      <ToggleButtonGroup value={value} exclusive>
        {optionsToShow.map((option) => {
          return (
            <Badge key={option.id} badgeContent={badgeContent(option)} color={badgeColor(option)}>
              <ToggleButton
                value={option.id}
                size="large"
                onClick={() => handleClick(option)}
                disabled={readOnly}
                sx={{ minWidth: 120 }}
              >
                {t(option.id)}
              </ToggleButton>
            </Badge>
          );
        })}
      </ToggleButtonGroup>
    </FormControl>
  );
};

export default SelectPace;
