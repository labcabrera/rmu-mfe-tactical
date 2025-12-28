import React, { FC } from 'react';
import { Stack, Chip } from '@mui/material';
import { t } from 'i18next';
import { KeyValueModifier } from '../../api/action.dto';

const KeyValueModifiersView: FC<{ modifiers?: KeyValueModifier[] | null }> = ({ modifiers }) => {
  if (!modifiers || modifiers.length === 0) return <div />;

  const getChipColor = (value: number) => {
    if (value > 0) return 'success';
    if (value < 0) return 'error';
    return 'primary';
  };

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
      {modifiers.map((m, idx) => (
        <Chip
          key={idx}
          label={`${t(m.key)}: ${m.value > 0 ? '+' : ''}${m.value}`}
          color={getChipColor(m.value) as any}
          variant={'filled'}
        />
      ))}
    </Stack>
  );
};

export default KeyValueModifiersView;
