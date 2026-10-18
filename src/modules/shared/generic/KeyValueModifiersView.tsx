import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Chip } from '@mui/material';
import { KeyValueModifier } from '../../api/action.dto';

const KeyValueModifiersView: FC<{ modifiers?: KeyValueModifier[] | null }> = ({ modifiers }) => {
  const { t } = useTranslation();
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
      useFlexGap
      sx={{
        flexWrap: 'wrap',
        alignContent: 'flex-start',
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
