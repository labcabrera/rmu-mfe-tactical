import React, { FC } from 'react';
import { Stack, Button, Typography, Badge } from '@mui/material';
import { t } from 'i18next';

const SelectRestrictedQuarters: FC<{
  value: string;
  onChange: (event: string) => void;
  readOnly?: boolean;
}> = ({ value, onChange, readOnly = false }) => {
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
    <div>
      <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
        {t('restricted-quarters')}
      </Typography>
      <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
        {options.map((option) => {
          const selected = option.id === value;
          return (
            <Badge key={option.id} badgeContent={badgeContent(option)} color={option.bonus >= 0 ? 'primary' : 'error'}>
              <Button
                key={option.id}
                size="small"
                variant={selected ? 'contained' : 'outlined'}
                color={selected ? 'primary' : 'inherit'}
                onClick={() => handleClick(option.id)}
                disabled={readOnly}
              >
                {t(`restricted-quarter-${option.id}`)}
              </Button>
            </Badge>
          );
        })}
      </Stack>
    </div>
  );
};

export default SelectRestrictedQuarters;
