import React, { FC } from 'react';
import { FormControl, FormLabel, Badge, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { t } from 'i18next';

const SelectPositionalTarget: FC<{
  value: string;
  onChange: (event: string) => void;
  name?: string;
  readOnly?: boolean;
}> = ({ value, onChange, name = 'positionalTarget', readOnly = false }) => {
  const labelId = `select-positional-target-${name}-label`;

  const options: { id: string; bonus: number }[] = [
    { id: 'none', bonus: 0 },
    { id: 'flank', bonus: 15 },
    { id: 'rear', bonus: 35 },
  ];

  const badgeContent = (option: { id: string; bonus: number }): string => {
    if (!option || !option.bonus || option.bonus === 0) return '+0';
    return option.bonus.toString();
  };

  const badgeColor = (option: { id: string; bonus: number }): 'success' | 'error' | 'secondary' => {
    if (option.bonus === 0) return 'secondary';
    return option.bonus > 0 ? 'success' : 'error';
  };

  const handleClick = (optionId: string) => {
    if (readOnly) return;
    onChange(optionId);
  };

  return (
    <FormControl component="fieldset">
      <FormLabel id={labelId} component="legend" sx={{ mb: 1.5, typography: 'body1' }}>
        {t('positional-target')}
      </FormLabel>
      <ToggleButtonGroup value={value} exclusive>
        {options.map((option) => (
          <Badge key={option.id} badgeContent={badgeContent(option)} color={badgeColor(option)}>
            <ToggleButton
              value={option.id}
              onClick={() => handleClick(option.id)}
              disabled={readOnly}
              sx={{ minWidth: 120 }}
            >
              {t(`positional-${option.id}`)}
            </ToggleButton>
          </Badge>
        ))}
      </ToggleButtonGroup>
    </FormControl>
  );
};

export default SelectPositionalTarget;
