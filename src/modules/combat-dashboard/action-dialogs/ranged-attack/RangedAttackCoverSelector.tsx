import React, { FC } from 'react';
import { Stack, Button, Typography, Badge, FormLabel, FormControl } from '@mui/material';
import { t } from 'i18next';

type CoverOption = {
  id: string;
  value: number;
};

const RangedAttackCoverSelector: FC<{
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}> = ({ value, onChange, readOnly = false }) => {
  const labelId = 'select-restricted-quarters-label';

  const options: CoverOption[] = [
    { id: 'none', value: 0 },
    { id: 'soft_partial', value: -20 },
    { id: 'soft_half', value: -40 },
    { id: 'soft_full', value: -100 },
    { id: 'hard_partial', value: -40 },
    { id: 'hard_half', value: -80 },
    { id: 'hard_full', value: -200 },
  ];

  const handleClick = (opt: CoverOption) => {
    if (readOnly) return;
    onChange(opt.id);
  };

  const badgeContent = (option: CoverOption): string => {
    if (!option || !option.value || option.value === 0) return '+0';
    return option.value.toString();
  };

  const badgeColor = (option: CoverOption): 'success' | 'error' | 'primary' => {
    if (option.value === 0) return 'primary';
    return option.value > 0 ? 'success' : 'error';
  };

  return (
    <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
      <FormLabel id={labelId} component="legend" sx={{ mb: 2, typography: 'body1' }}>
        {t('cover')}
      </FormLabel>
      <Stack direction="row" aria-labelledby={labelId} spacing={readOnly ? 1 : 3} sx={{ flexWrap: 'wrap' }}>
        {options.map((option) => {
          const selected = option.id === value;
          return (
            <Badge key={option.value} badgeContent={badgeContent(option)} color={badgeColor(option)}>
              <Button
                size="small"
                variant={selected ? 'contained' : 'outlined'}
                color={selected ? 'primary' : 'inherit'}
                onClick={() => handleClick(option)}
                disabled={readOnly}
              >
                {t(`cover-${option.id}`)}
              </Button>
            </Badge>
          );
        })}
      </Stack>
    </FormControl>
  );
};

export default RangedAttackCoverSelector;
