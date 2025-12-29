import React, { FC } from 'react';
import { Stack, Button, FormControl, FormLabel, Badge } from '@mui/material';
import { t } from 'i18next';

const SelectPositionalSource: FC<{
  value: string;
  onChange: (event: string) => void;
  name?: string;
  readOnly?: boolean;
}> = ({ value, onChange, name = 'positionalSource', readOnly = false }) => {
  const labelId = `select-positional-source-${name}-label`;

  const options: { id: string; bonus: number }[] = [
    { id: 'none', bonus: 0 },
    { id: 'to_flank', bonus: -30 },
    { id: 'to_rear', bonus: -70 },
  ];

  const handleClick = (option: string) => {
    if (readOnly) return;
    onChange(option);
  };

  return (
    <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
      <FormLabel id={labelId} component="legend" sx={{ mb: 1, typography: 'body1' }}>
        {t('positional-source')}
      </FormLabel>
      <Stack role="group" aria-labelledby={labelId} direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {options.map((option) => {
          const selected = option.id === value;
          const badge = option.bonus === 0 ? null : option.bonus > 0 ? `+${option.bonus}` : option.bonus;
          return (
            <Badge key={option.id} badgeContent={badge} color={option.bonus >= 0 ? 'primary' : 'error'}>
              <Button
                key={option.id}
                size="small"
                variant={selected ? 'contained' : 'outlined'}
                color={selected ? 'primary' : 'inherit'}
                onClick={() => handleClick(option.id)}
                disabled={readOnly}
              >
                {t(`positional-${option.id}`)}
              </Button>
            </Badge>
          );
        })}
      </Stack>
    </FormControl>
  );
};

export default SelectPositionalSource;
