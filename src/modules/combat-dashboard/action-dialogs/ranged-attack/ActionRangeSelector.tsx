import React, { FC } from 'react';
import { Stack, Button, Badge, FormControl, FormLabel } from '@mui/material';
import { t } from 'i18next';
import { ActorRoundAttack, ActorRoundAttackRange } from '../../../api/actor-rounds.dto';

const ActionRangeSelector: FC<{
  attack: ActorRoundAttack;
  value: number | null;
  onChange: (value: number | null) => void;
  readOnly?: boolean;
}> = ({ attack, value, onChange, readOnly = false }) => {
  const labelId = 'action-range-selector-label';

  const handleClick = (opt: ActorRoundAttackRange) => {
    if (readOnly) return;
    onChange(opt.from + (opt.to - opt.from) / 2);
  };

  return (
    <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
      <FormLabel id={labelId} component="legend" sx={{ mb: 1, typography: 'body1' }}>
        {t('range')}
      </FormLabel>
      <Stack direction="row" spacing={readOnly ? 1 : 2} sx={{ flexWrap: 'wrap' }}>
        {attack.ranges!.map((option) => {
          const selected = value && option.from <= value && option.to >= value;
          return (
            <Badge
              key={`${option.from}-${option.to}`}
              badgeContent={option.bonus}
              color={option.bonus >= 0 ? 'success' : 'error'}
            >
              <Button
                size="small"
                variant={selected ? 'contained' : 'outlined'}
                color={selected ? 'primary' : 'inherit'}
                onClick={() => handleClick(option)}
                disabled={readOnly}
              >
                {option.from}-{option.to}
              </Button>
            </Badge>
          );
        })}
      </Stack>
    </FormControl>
  );
};

export default ActionRangeSelector;
