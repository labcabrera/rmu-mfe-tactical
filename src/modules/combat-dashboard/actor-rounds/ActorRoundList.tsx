import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography, useMediaQuery, useTheme } from '@mui/material';
import { EmptyState, LoadingState } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { useElementWidth } from '../../shared/hooks/use-element-width';
import { useCombatPanel } from '../panel/CombatPanelProvider';
import CombatActorRoundListItem from './ActorRoundListItem';
import {
  phaseNumber,
  ROUND_GRID_COLUMNS,
  ROUND_GRID_COLUMNS_NO_EFFECTS,
  ROUND_GRID_MIN_WIDTH,
  ROUND_GRID_MIN_WIDTH_NO_EFFECTS,
} from './round-grid';

/**
 * Round board. From `md` it is a grid (actor, initiative, declaration, phases 1-4, and an effects column when the
 * board itself is wide enough for it) that scrolls inside its area with the actor column sticky; below `md`, one
 * card per actor with a phase switcher. The effects column follows the board's width, not the window's: with the
 * side navigation expanded a 1440 px screen has no room for it (spec 017).
 * Actors and actions open in the side panel (`CombatPanelProvider`); "Declare" opens the action palette.
 */
const CombatActorRoundList: FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('md'));
  const wideWindow = useMediaQuery(theme.breakpoints.up('lg'));
  const [boardRef, boardWidth] = useElementWidth<HTMLDivElement>();
  // Until the board is measured, the window breakpoint decides.
  const withEffects = boardWidth === null ? wideWindow : boardWidth >= ROUND_GRID_MIN_WIDTH;
  const { game, actorRounds, displayRound } = useContext(CombatContext)!;
  const { selectedActorRoundId, openActor, openAction, openDeclare } = useCombatPanel();
  const [phonePhase, setPhonePhase] = useState<number | null>(null);

  if (!game || !actorRounds || displayRound === null) return <LoadingState />;
  if (actorRounds.length === 0) return <EmptyState />;

  // Earlier rounds are read-only: no phase, so no declaration.
  const history = displayRound !== game.round;
  const displayPhase = history ? 'history' : game.phase;
  const currentPhase = phaseNumber(game.phase);
  const shownPhase = phonePhase ?? (currentPhase <= 4 ? currentPhase : 1);
  const columns = withEffects ? ROUND_GRID_COLUMNS : ROUND_GRID_COLUMNS_NO_EFFECTS;

  const items = actorRounds.map((actorRound, index) => (
    <CombatActorRoundListItem
      key={actorRound.id ?? index}
      actorRound={actorRound}
      displayPhase={displayPhase}
      compact={compact}
      withEffects={withEffects}
      columns={columns}
      phonePhase={shownPhase}
      selected={actorRound.id === selectedActorRoundId}
      onActorRoundView={openActor}
      onOpenAction={openAction}
      onDeclare={openDeclare}
    />
  ));

  if (compact) {
    return (
      <Stack spacing={1.5}>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={shownPhase}
          onChange={(_, phase: number | null) => phase && setPhonePhase(phase)}
          aria-label={t('phase')}
        >
          {[1, 2, 3, 4].map((phase) => (
            <ToggleButton key={phase} value={phase}>
              {t('phase-n', { phase })}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        {items}
      </Stack>
    );
  }

  return (
    <Paper ref={boardRef} sx={{ overflowX: 'auto' }}>
      <Box sx={{ minWidth: withEffects ? ROUND_GRID_MIN_WIDTH : ROUND_GRID_MIN_WIDTH_NO_EFFECTS }}>
        <RoundGridHeader columns={columns} withEffects={withEffects} currentPhase={history ? 0 : currentPhase} />
        {items}
      </Box>
    </Paper>
  );
};

const RoundGridHeader: FC<{ columns: string; withEffects: boolean; currentPhase: number }> = ({
  columns,
  withEffects,
  currentPhase,
}) => {
  const { t } = useTranslation();
  const cell = (label: string, active = false, sticky = false) => (
    <Box
      sx={{
        px: 1.25,
        py: 1,
        ...(sticky && { position: 'sticky', left: 0, zIndex: 2, bgcolor: 'background.paper' }),
        ...(active && { color: 'primary.main', boxShadow: (theme) => `inset 0 -3px 0 ${theme.palette.primary.main}` }),
      }}
    >
      <Typography variant="overline" sx={{ lineHeight: 1.5 }} color={active ? 'primary' : 'text.secondary'} noWrap>
        {label}
      </Typography>
    </Box>
  );
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: columns,
        borderBottom: 1,
        borderColor: 'divider',
        position: 'sticky',
        top: 0,
        zIndex: 3,
        bgcolor: 'background.paper',
      }}
    >
      {cell(t('actors'), false, true)}
      {cell(t('initiative'))}
      {cell(t('declare'))}
      {[1, 2, 3, 4].map((phase) => (
        <React.Fragment key={phase}>{cell(t('phase-n', { phase }), phase === currentPhase)}</React.Fragment>
      ))}
      {withEffects && cell(t('effects'))}
    </Box>
  );
};

export default CombatActorRoundList;
