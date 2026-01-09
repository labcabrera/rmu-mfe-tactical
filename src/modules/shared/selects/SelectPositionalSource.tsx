import React, { FC } from 'react';
import { FormControl, Badge, ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material';
import { t } from 'i18next';

const SelectPositionalSource: FC<{
  value: string;
  onChange: (event: string) => void;
  readOnly?: boolean;
}> = ({ value, onChange, readOnly = false }) => {
  const options: { id: string; bonus: number }[] = [
    { id: 'none', bonus: 0 },
    { id: 'to_flank', bonus: -30 },
    { id: 'to_rear', bonus: -70 },
  ];

  const badgeContent = (option: { id: string; bonus: number }): string => {
    if (!option || !option.bonus || option.bonus === 0) return '+0';
    return option.bonus.toString();
  };

  const badgeColor = (option: { id: string; bonus: number }): 'success' | 'error' | 'secondary' => {
    if (option.bonus === 0) return 'secondary';
    return option.bonus > 0 ? 'success' : 'error';
  };

  const handleClick = (option: string) => {
    if (readOnly) return;
    onChange(option);
  };

  return (
    <Tooltip title={t('positional-source')}>
      <FormControl component="fieldset" variant="standard">
        <ToggleButtonGroup value={value} exclusive>
          {options.map((option) => (
            <Badge key={option.id} badgeContent={badgeContent(option)} color={badgeColor(option)}>
              <ToggleButton
                value={option.id}
                onClick={() => handleClick(option.id)}
                disabled={readOnly}
                size="small"
                sx={{ minWidth: 140 }}
              >
                {t(`positional-${option.id}`)}
              </ToggleButton>
            </Badge>
          ))}
        </ToggleButtonGroup>
      </FormControl>
    </Tooltip>
  );
};

export default SelectPositionalSource;
