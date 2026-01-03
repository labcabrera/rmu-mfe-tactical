import React, { FC } from 'react';
import { FormControl, FormLabel, Badge, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { t } from 'i18next';

const SelectRestrictedQuarters: FC<{
  value: string;
  onChange: (event: string) => void;
  readOnly?: boolean;
}> = ({ value, onChange, readOnly = false }) => {
  const labelId = 'select-restricted-quarters-label';

  const options: { id: string; bonus: number }[] = [
    { id: 'none', bonus: 0 },
    { id: 'close', bonus: -25 },
    { id: 'cramped', bonus: -50 },
    { id: 'tight', bonus: -75 },
    { id: 'confined', bonus: -100 },
  ];

  const handleClick = (optionId: string) => {
    if (readOnly) return;
    onChange(optionId);
  };

  const badgeContent = (option: { id: string; bonus: number }) => {
    if (!option || !option.bonus || option.bonus === 0) return '+0';
    return option.bonus;
  };

  return (
    <FormControl component="fieldset">
      <FormLabel id={labelId} component="legend" sx={{ mb: 1, typography: 'body1' }}>
        {t('restricted-quarters')}
      </FormLabel>
      <ToggleButtonGroup value={value} exclusive>
        {options.map((option) => (
          <Badge key={option.id} badgeContent={badgeContent(option)} color={option.bonus >= 0 ? 'secondary' : 'error'}>
            <ToggleButton
              value={option.id}
              onClick={() => handleClick(option.id)}
              disabled={readOnly}
              sx={{ minWidth: 140 }}
            >
              {t(`restricted-quarter-${option.id}`)}
            </ToggleButton>
          </Badge>
        ))}
      </ToggleButtonGroup>
    </FormControl>
  );
};

export default SelectRestrictedQuarters;
