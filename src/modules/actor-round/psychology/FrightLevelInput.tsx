import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, Stack } from '@mui/material';
import { NumberPadField, ChipRow } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useFrightLevels } from '../../services/core-tables';

/**
 * Fright level of a fear RR (Table 14-3a): a number, with the levels of the table as shortcuts and its supernatural
 * modifiers added to the chosen level. Since workspace spec 068 the table comes from the game (`fright-levels`), so
 * every participant has the shortcuts, not only the rmu-core-law role.
 */
const FrightLevelInput: FC<{
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
  const { t } = useTranslation();
  const tables = useFrightLevels();
  return (
    <Stack spacing={1}>
      <Box sx={{ maxWidth: 200 }}>
        <NumberPadField
          label={t('fright-level')}
          value={value}
          onChange={onChange}
          integer
          min={0}
          disabled={disabled}
        />
      </Box>
      {tables && (
        <ChipRow>
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
        </ChipRow>
      )}
    </Stack>
  );
};

export default FrightLevelInput;
