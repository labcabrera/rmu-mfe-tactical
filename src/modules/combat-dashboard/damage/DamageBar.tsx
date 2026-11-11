import { FC } from 'react';
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { barShare } from './combat-damage';

const NUMERIC_SX = { fontVariantNumeric: 'tabular-nums' };

/**
 * A damage figure with its bar: the damage of the attack table and of the criticals stacked, filling the part of
 * `max` they reach (the most damage of any actor, or the hits of the target). The tooltip and the label give the detail.
 */
const DamageBar: FC<{
  tableDamage: number;
  criticalDamage: number;
  max: number | null | undefined;
  /** Breakdown shown on hover and read by screen readers. */
  detail: string;
}> = ({ tableDamage, criticalDamage, max, detail }) => {
  const table = barShare(tableDamage, max);
  const critical = Math.min(1 - table, barShare(criticalDamage, max));
  return (
    <Tooltip title={detail}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
        <Box
          role="img"
          aria-label={detail}
          sx={{
            display: 'flex',
            width: { xs: 64, sm: 96, md: 120 },
            height: 8,
            borderRadius: 4,
            overflow: 'hidden',
            bgcolor: 'action.hover',
            flexShrink: 0,
          }}
        >
          <Box sx={{ width: `${table * 100}%`, bgcolor: 'error.main' }} />
          <Box sx={{ width: `${critical * 100}%`, bgcolor: 'warning.main' }} />
        </Box>
        <Typography variant="body2" sx={{ ...NUMERIC_SX, minWidth: 28, textAlign: 'right' }}>
          {tableDamage + criticalDamage}
        </Typography>
      </Stack>
    </Tooltip>
  );
};

export default DamageBar;
