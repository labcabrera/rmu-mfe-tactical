import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import { formatBonus } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ModifierOption } from '../attack/modifiers/attack-modifier-fields';

interface ChipOption {
  key: string;
  label: string;
  value?: number | null;
  hint?: string;
}

/** Long labels wrap on narrow screens instead of being cut; a short one keeps the height of the difficulty chips. */
const WRAPPING_CHIP = { height: 'auto', minHeight: 32, '& .MuiChip-label': { whiteSpace: 'normal', py: 0.5 } };

const OptionChip: FC<{ option: ChipOption; selected: boolean; role: 'radio' | 'checkbox'; onClick: () => void }> = ({
  option,
  selected,
  role,
  onClick,
}) => {
  const chip = (
    <Chip
      role={role}
      aria-checked={selected}
      label={typeof option.value === 'number' ? `${option.label} ${formatBonus(option.value)}` : option.label}
      color={selected ? 'primary' : 'default'}
      onClick={onClick}
      sx={WRAPPING_CHIP}
    />
  );
  return option.hint ? (
    <Tooltip title={option.hint} describeChild>
      {chip}
    </Tooltip>
  ) : (
    chip
  );
};

const ChipGroup: FC<{ label?: string; role: 'radiogroup' | 'group'; children: ReactNode }> = ({
  label,
  role,
  children,
}) => (
  <Box role={role} aria-label={label}>
    {label && (
      <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
    )}
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>{children}</Box>
  </Box>
);

/**
 * One choice of the maneuver dialog as chips, the same ones as the difficulty. Choosing the selected option again
 * reports it too, so that the callers that allow it can clear the choice.
 */
const OptionChips: FC<{
  label?: string;
  options: ModifierOption[];
  value: string;
  onChange: (key: string) => void;
  /** Label of an option; defaults to the translation of its key. */
  optionLabel?: (option: ModifierOption) => string;
}> = ({ label, options, value, onChange, optionLabel }) => {
  const { t } = useTranslation();
  return (
    <ChipGroup label={label} role="radiogroup">
      {options.map((option) => (
        <OptionChip
          key={option.key}
          option={{ ...option, label: optionLabel ? optionLabel(option) : t(option.key) }}
          selected={option.key === value}
          role="radio"
          onClick={() => onChange(option.key)}
        />
      ))}
    </ChipGroup>
  );
};

/** Options that are turned on and off one by one, with the same chips as a choice. */
export const ToggleChips: FC<{
  label?: string;
  options: ChipOption[];
  selected: string[];
  onToggle: (key: string) => void;
}> = ({ label, options, selected, onToggle }) => (
  <ChipGroup label={label} role="group">
    {options.map((option) => (
      <OptionChip
        key={option.key}
        option={option}
        selected={selected.includes(option.key)}
        role="checkbox"
        onClick={() => onToggle(option.key)}
      />
    ))}
  </ChipGroup>
);

export default OptionChips;
