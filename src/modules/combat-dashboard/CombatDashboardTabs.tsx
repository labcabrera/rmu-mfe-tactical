import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import { Box, IconButton, Paper, Stack, Tab, Tabs, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { CombatContext } from '../../CombatContext';
import { useShortcut } from '../services/shortcuts';
import GameOutcomePanel from '../tactical-games/outcome/GameOutcomePanel';
import CombatDashboardActions from './CombatDashboardActions';
import ShortcutsHelp from './ShortcutsHelp';
import CombatActorRoundList from './actor-rounds/ActorRoundList';
import CombatRoundHeader from './actor-rounds/CombatRoundHeader';
import RoundLog, { RoundLogStrip } from './log/RoundLog';
import CombatPanelProvider from './panel/CombatPanelProvider';

type View = 'board' | 'log';

/**
 * Combat screen: breadcrumbs, the round header, and two views (board and log) next to the side panel where
 * actors and actions open.
 */
const CombatDashboardTabs: FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const wide = useMediaQuery(theme.breakpoints.up('lg'));
  const [view, setView] = useState<View>('board');
  const [help, setHelp] = useState(false);
  const { game, setGame } = useContext(CombatContext)!;
  useShortcut(['l', 'L'], () => setView((current) => (current === 'board' ? 'log' : 'board')));
  useShortcut(['?'], () => setHelp(true));

  return (
    <Stack spacing={1.5}>
      <CombatDashboardActions />
      <CombatRoundHeader />
      {game?.status === 'finished' && <GameOutcomePanel game={game} onApplied={setGame} collapsible />}
      <CombatPanelProvider>
        <Stack spacing={1.5}>
          <Paper sx={{ px: 1.5, display: 'flex', alignItems: 'center' }}>
            <Tabs
              value={view}
              onChange={(_, value: View) => setView(value)}
              aria-label={t('combat-dashboard-tabs')}
              sx={{ flex: 1 }}
            >
              <Tab value="board" label={t('board')} />
              <Tab value="log" label={t('log')} />
            </Tabs>
            <Tooltip title={t('keyboard-shortcuts')}>
              <IconButton aria-label={t('keyboard-shortcuts')} onClick={() => setHelp(true)}>
                <KeyboardIcon />
              </IconButton>
            </Tooltip>
          </Paper>
          {view === 'board' ? (
            <>
              <CombatActorRoundList />
              {wide && <RoundLogStrip onOpenLog={() => setView('log')} />}
            </>
          ) : (
            <Paper sx={{ p: 2 }}>
              <Box role="tabpanel">
                <RoundLog />
              </Box>
            </Paper>
          )}
        </Stack>
      </CombatPanelProvider>
      <ShortcutsHelp open={help} onClose={() => setHelp(false)} />
    </Stack>
  );
};

export default CombatDashboardTabs;
