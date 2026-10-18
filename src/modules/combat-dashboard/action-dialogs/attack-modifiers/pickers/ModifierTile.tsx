import React, { FC, ReactNode } from 'react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { alpha, Box, ButtonBase, Tooltip, Typography } from '@mui/material';
import { formatBonus } from '@labcabrera-rmu/rmu-react-shared-lib';

/**
 * One option of the attack form, always the same size: its name and, when it has one, the value it adds to the
 * roll as a badge (green or red). Without a label (a cell of a labelled matrix) it shows the badge alone. Selected tiles take the accent color. `auto` marks values that came from the
 * target's effects.
 */
const ModifierTile: FC<{
  /** Accessible name when `label` is empty (matrix cells). */
  ariaLabel?: string;
  label: string;
  value?: number | null;
  selected: boolean;
  onClick: () => void;
  role?: 'checkbox' | 'radio';
  auto?: string;
  icon?: ReactNode;
}> = ({ ariaLabel, label, value, selected, onClick, role = 'checkbox', auto, icon }) => {
  const tile = (
    <ButtonBase
      role={role}
      aria-checked={selected}
      aria-label={ariaLabel}
      onClick={onClick}
      sx={(theme) => ({
        width: '100%',
        minHeight: 52,
        px: 1.25,
        py: 0.75,
        gap: 1,
        justifyContent: label ? 'space-between' : 'center',
        textAlign: 'left',
        borderRadius: `${theme.radius.sm}px`,
        border: 1,
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? alpha(theme.palette.primary.main, 0.14) : 'background.light',
        transition: theme.transitions.create(['background-color', 'border-color']),
        '&:hover': { borderColor: selected ? 'primary.main' : 'text.secondary' },
      })}
    >
      {label && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
          {icon}
          {auto && <AutoAwesomeIcon fontSize="small" color="primary" />}
          <Typography variant="body2" sx={{ fontWeight: selected ? 700 : 500, lineHeight: 1.2 }}>
            {label}
          </Typography>
        </Box>
      )}
      {typeof value === 'number' && value !== 0 && (
        <Box
          sx={{
            px: 0.75,
            borderRadius: 1,
            flexShrink: 0,
            fontSize: 12,
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            color: value > 0 ? 'success.main' : 'error.main',
            border: 1,
            borderColor: 'currentColor',
          }}
        >
          {formatBonus(value)}
        </Box>
      )}
    </ButtonBase>
  );
  return auto ? <Tooltip title={auto}>{tile}</Tooltip> : tile;
};

export default ModifierTile;
