import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { RmuDialog } from '@labcabrera-rmu/rmu-react-shared-lib';

const SHORTCUTS: [string[], string][] = [
  [['J', 'K'], 'shortcut-select-actor'],
  [['↑', '↓'], 'shortcut-select-actor-arrows'],
  [['Enter'], 'shortcut-open-action'],
  [['A'], 'shortcut-declare'],
  [['F'], 'shortcut-actor-detail'],
  [['N'], 'shortcut-next-phase'],
  [['L'], 'shortcut-toggle-log'],
  [['Esc'], 'shortcut-close-panel'],
  [['?'], 'shortcut-help'],
];

/** Keyboard shortcuts of the combat screen. */
const ShortcutsHelp: FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { t } = useTranslation();
  return (
    <RmuDialog title={t('keyboard-shortcuts')} open={open} onClose={onClose} maxWidth="xs">
      <Stack spacing={1.25}>
        {SHORTCUTS.map(([keys, description]) => (
          <Stack key={description} direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 104, display: 'flex', gap: 0.5, flexShrink: 0 }}>
              {keys.map((key) => (
                <Chip key={key} size="small" variant="outlined" label={key} sx={{ fontFamily: 'monospace' }} />
              ))}
            </Box>
            <Typography variant="body2">{t(description)}</Typography>
          </Stack>
        ))}
      </Stack>
    </RmuDialog>
  );
};

export default ShortcutsHelp;
