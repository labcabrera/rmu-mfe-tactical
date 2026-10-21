import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';
import { ModifierOption } from '../attack-modifier-fields';
import ModifierTile from './ModifierTile';

/** A choice as a group of same-size tiles with their values, instead of a select. */
const OptionTiles: FC<{
  label: string;
  options: ModifierOption[];
  value: string;
  onChange: (key: string) => void;
  minTileWidth?: number;
  /** Label of an option; defaults to the translation of its key. */
  optionLabel?: (option: ModifierOption) => string;
}> = ({ label, options, value, onChange, minTileWidth = 120, optionLabel }) => {
  const { t } = useTranslation();
  return (
    <Box role="radiogroup" aria-label={label}>
      <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${minTileWidth}px, 1fr))`, gap: 1 }}>
        {options.map((option) => (
          <ModifierTile
            key={option.key}
            role="radio"
            label={optionLabel ? optionLabel(option) : t(option.key)}
            value={option.value}
            selected={option.key === value}
            onClick={() => onChange(option.key)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default OptionTiles;
