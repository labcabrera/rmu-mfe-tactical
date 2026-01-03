import React, { FC } from 'react';
import { Stack, Chip } from '@mui/material';
import { t } from 'i18next';
import { KeyValueModifier } from '../../api/action.dto';

const KeyValueModifiersView: FC<{ modifiers?: KeyValueModifier[] | null }> = ({ modifiers }) => {
  if (!modifiers || modifiers.length === 0) return <div />;

  const getModifierColor = (value: number) => {
    if (value > 0) return 'success';
    if (value < 0) return 'error';
    return undefined;
  };

  return (
    <Stack
      direction="row"
      spacing={1}
      flexWrap="wrap"
      useFlexGap
      alignContent="flex-start"
      sx={{
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
      }}
    >
      {modifiers.map((item, index) => (
        <Chip key={index} label={`${t(item.key)}: ${item.value}`} color={getModifierColor(item.value)} sx={{ m: 0 }} />
      ))}
    </Stack>
  );
};

export default KeyValueModifiersView;
