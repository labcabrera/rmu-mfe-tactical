import React, { FC } from 'react';
import { Stack, Chip } from '@mui/material';
import { t } from 'i18next';
import { RollModifier } from '../../api/action.dto';

const getChipColor = (value: number) => {
  if (value > 0) return 'success';
  if (value < 0) return 'error';
  return 'primary';
};

const RollModifiersView: FC<{ modifiers?: RollModifier[] | null }> = ({ modifiers }) => {
  if (!modifiers || modifiers.length === 0) return <div />;

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
      {modifiers.map((m, idx) => (
        <Chip
          key={idx}
          label={`${t(m.key)}: ${m.value > 0 ? '+' : ''}${m.value}`}
          color={getChipColor(m.value) as any}
          //   size="small"
          //   variant={getChipColor(m.value) === 'default' ? 'outlined' : 'filled'}
          variant={'filled'}
        />
      ))}
    </Stack>
  );
};

export default RollModifiersView;
