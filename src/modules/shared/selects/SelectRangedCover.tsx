import React, { FC } from 'react';
import { Badge, FormControl, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { t } from 'i18next';

const options: { id: string; value: number }[] = [
  { id: 'none', value: 0 },
  { id: 'soft_partial', value: -20 },
  { id: 'soft_half', value: -40 },
  { id: 'soft_full', value: -100 },
  { id: 'hard_partial', value: -40 },
  { id: 'hard_half', value: -80 },
  { id: 'hard_full', value: -200 },
];

const SelectRangedCover: FC<{
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}> = ({ value, onChange, readOnly = false }) => {
  const handleClick = (opt: { id: string; value: number }) => {
    if (readOnly) return;
    onChange(opt.id);
  };

  const badgeContent = (option: { id: string; value: number }): string => {
    if (!option || !option.value || option.value === 0) return '+0';
    return option.value.toString();
  };

  const badgeColor = (option: { id: string; value: number }): 'success' | 'error' | 'secondary' => {
    if (option.value === 0) return 'secondary';
    return option.value > 0 ? 'success' : 'error';
  };

  return (
    <FormControl component="fieldset">
      <ToggleButtonGroup value={value} exclusive>
        {options.map((option) => (
          <Badge key={option.value} badgeContent={badgeContent(option)} color={badgeColor(option)}>
            <ToggleButton
              value={option.id}
              onClick={() => handleClick(option)}
              disabled={readOnly}
              size="small"
              sx={{ minWidth: 140 }}
            >
              {t(`${option.id}`)}
            </ToggleButton>
          </Badge>
        ))}
      </ToggleButtonGroup>
    </FormControl>
  );
};

export default SelectRangedCover;
