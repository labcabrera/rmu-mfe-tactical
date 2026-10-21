import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, Typography } from '@mui/material';
import { formatBonus, KeyValue } from '@labcabrera-rmu/rmu-react-shared-lib';
import { DIFFICULTY_TABLE } from '../../../api/action.dto';

/** Maneuver difficulty as a wrap of chips with their bonus, in place of a select in a dialog. */
const DifficultyPicker: FC<{
  value: string | null | undefined;
  onChange: (difficulty: string) => void;
  /** Marks the actor's base difficulty (movement). */
  base?: string;
  /** Difficulties to offer, e.g. from the maneuver modifiers listing; defaults to Table 5-2. */
  options?: KeyValue[];
}> = ({ value, onChange, base, options = DIFFICULTY_TABLE }) => {
  const { t } = useTranslation();
  return (
    <Box role="radiogroup" aria-label={t('difficulty')}>
      <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 0.5 }}>
        {t('difficulty')}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {options.map((option) => {
          const selected = option.key === value;
          return (
            <Chip
              key={option.key}
              role="radio"
              aria-checked={selected}
              label={`${t(`difficulty-${option.key}`)} ${formatBonus(option.value)}`}
              color={selected ? 'primary' : 'default'}
              variant={selected ? 'filled' : option.key === base ? 'outlined' : 'filled'}
              onClick={() => onChange(option.key)}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default DifficultyPicker;
