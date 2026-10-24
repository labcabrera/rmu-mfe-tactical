import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, Stack } from '@mui/material';
import { NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';
import { usePsychologyTables } from '../../services/core-tables';

/**
 * Fright level of a fear RR (Table 14-3a): a number, with the levels of core's table as shortcuts when it is
 * available, and its supernatural modifiers added to the chosen level.
 */
const FrightLevelInput: FC<{
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
  const { t } = useTranslation();
  const tables = usePsychologyTables();
  return (
    <Stack spacing={1}>
      <Box sx={{ maxWidth: 200 }}>
        <NumericInput
          label={t('fright-level')}
          value={value}
          onChange={onChange}
          integer
          min={0}
          disabled={disabled}
        />
      </Box>
      {tables && (
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
          {tables.frightLevels.map((level) => (
            <Chip
              key={level.key}
              size="small"
              label={`${t(`fright-${level.key}`, { defaultValue: level.key })} ${level.level}`}
              color={value === level.level ? 'primary' : 'default'}
              onClick={() => onChange(level.level)}
              disabled={disabled}
            />
          ))}
          {tables.frightLevelModifiers.map((modifier) => (
            <Chip
              key={modifier.key}
              size="small"
              variant="outlined"
              label={`${t(`fright-${modifier.key}`, { defaultValue: modifier.key })} +${modifier.level}`}
              onClick={() => onChange((value ?? 0) + modifier.level)}
              disabled={disabled}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default FrightLevelInput;
