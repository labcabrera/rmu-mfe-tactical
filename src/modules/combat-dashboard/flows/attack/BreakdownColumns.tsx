import { FC, ReactNode } from 'react';
import { Box, Stack } from '@mui/material';

/**
 * The always-open breakdown of the attack roll beside what the step asks for (the parry, the rolls, the result): in a
 * side column that stays in view from tablet width, above it on narrower screens. The combat dashboard is meant for
 * tablets and computers, so the step keeps the width it needs instead of a full-width list of modifiers.
 */
const BreakdownColumns: FC<{ breakdown: ReactNode; children: ReactNode }> = ({ breakdown, children }) => (
  <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: { md: 'flex-start' } }}>
    <Box
      component="aside"
      sx={{
        width: { xs: '100%', md: 340, xl: 400 },
        flexShrink: 0,
        position: { md: 'sticky' },
        top: { md: 8 },
      }}
    >
      {breakdown}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
  </Stack>
);

export default BreakdownColumns;
