import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import { alpha, Box, Button, Paper, Stack, Typography } from '@mui/material';
import { ApPips } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { Action } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';
import { apCapacity } from '../../services/ap-service';
import { useFactionColor } from '../../services/faction-colors';
import ActorAction from './ActorAction';
import ActorActions from './ActorActions';
import ActorRoundEffects from './ActorRoundEffects';
import ActorRoundResume from './ActorRoundResume';
import ActorRoundInitiative from './initiative/ActorRoundInitiative';
import { phaseNumber } from './round-grid';

const CombatActorRoundListItem: FC<{
  actorRound: ActorRound;
  /** The game phase, or `history` for an earlier round (read-only). */
  displayPhase: string;
  onActorRoundView: (actorRound: ActorRound) => void;
  onOpenAction: (action: Action) => void;
  /** Set while actions can be declared: opens the action palette. */
  onDeclare?: (actorRound: ActorRound, anchor: HTMLElement) => void;
  /** Below `md`: a card with the actions of one phase instead of a row of the board grid. */
  compact?: boolean;
  /** The board has an effects column (from `lg`); otherwise the effects go into the actor cell. */
  withEffects?: boolean;
  columns: string;
  /** Phase whose actions the compact card shows. */
  phonePhase?: number;
  selected?: boolean;
}> = ({
  actorRound,
  displayPhase,
  onActorRoundView,
  onOpenAction,
  onDeclare,
  compact = false,
  withEffects = true,
  columns,
  phonePhase = 1,
  selected = false,
}) => {
  const { t } = useTranslation();
  const { game } = useContext(CombatContext)!;
  const factionColor = useFactionColor();

  if (!actorRound || !game) return null;

  const currentPhase = phaseNumber(displayPhase);
  const down = actorRound.effects.some((e) => e.status === 'dead' || e.status === 'unconcious');
  const effects = <ActorRoundEffects actorRound={actorRound} />;
  const resume = (
    <ActorRoundResume
      actorRound={actorRound}
      selected={selected}
      onActorRoundView={() => onActorRoundView(actorRound)}
      extra={withEffects && !compact ? undefined : effects}
    />
  );
  const initiative = <ActorRoundInitiative actorRound={actorRound} />;
  const declaration = onDeclare && !down && (
    <Button
      variant="outlined"
      size="small"
      startIcon={<AddIcon />}
      fullWidth={compact}
      onClick={(e) => onDeclare(actorRound, e.currentTarget)}
    >
      {t('declare')}
    </Button>
  );
  const cellSx = { minWidth: 0, borderLeft: 1, borderColor: 'divider' };
  // Action points of each phase (spec 011, §8.1): earlier rounds show them as they ended.
  const pips = (
    <ApPips
      capacity={apCapacity(actorRound)}
      ledger={actorRound.apLedger}
      currentPhase={currentPhase <= 4 ? currentPhase : 0}
    />
  );

  if (compact) {
    return (
      <Paper
        sx={(theme) => ({
          overflow: 'hidden',
          borderColor: selected ? 'primary.main' : 'divider',
          borderLeft: `4px solid ${factionColor(actorRound.factionId)}`,
          bgcolor: selected ? alpha(theme.palette.primary.main, 0.05) : undefined,
        })}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 132px' }}>
          {resume}
          <Box sx={cellSx}>{initiative}</Box>
        </Box>
        {declaration && <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>{declaration}</Box>}
        <Box sx={{ px: 1, py: 0.75, borderTop: 1, borderColor: 'divider' }}>{pips}</Box>
        <PhaseActions
          actorId={actorRound.actorId}
          phase={phonePhase}
          currentPhase={currentPhase}
          onClick={onOpenAction}
        />
      </Paper>
    );
  }

  return (
    <Box
      sx={(theme) => ({
        display: 'grid',
        gridTemplateColumns: columns,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: selected ? alpha(theme.palette.primary.main, 0.05) : undefined,
      })}
    >
      <Box
        sx={(theme) => ({
          position: 'sticky',
          left: 0,
          zIndex: 1,
          minWidth: 0,
          // Opaque, so the scrolled cells pass under it.
          bgcolor: selected
            ? `color-mix(in srgb, ${theme.palette.primary.main} 5%, ${theme.palette.background.paper})`
            : 'background.paper',
          // A thin stripe in the faction color tells the sides apart without changing the board.
          boxShadow: `inset 4px 0 0 ${factionColor(actorRound.factionId)}`,
        })}
      >
        {resume}
      </Box>
      <Box sx={cellSx}>{initiative}</Box>
      <Box sx={{ ...cellSx, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', p: 1 }}>
        {declaration}
      </Box>
      <Box sx={{ ...cellSx, gridColumn: 'span 4', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1 }}>
          <ActorActions actorId={actorRound.actorId} currentPhase={currentPhase} onActionClick={onOpenAction} />
        </Box>
        {/* Same padding and gap as the action grid, so each phase's points sit under its column. */}
        <Box sx={{ px: 1, pb: 1 }}>{pips}</Box>
      </Box>
      {withEffects && <Box sx={cellSx}>{effects}</Box>}
    </Box>
  );
};

/** Compact card: the actions of the actor that take place in one phase. */
const PhaseActions: FC<{
  actorId: string;
  phase: number;
  currentPhase: number;
  onClick: (action: Action) => void;
}> = ({ actorId, phase, currentPhase, onClick }) => {
  const { t } = useTranslation();
  const { roundActions } = useContext(CombatContext)!;
  const actions = (roundActions ?? []).filter(
    (a) => a.actorId === actorId && a.phaseStart <= phase && (a.phaseEnd ?? currentPhase) >= phase
  );
  return (
    <Stack spacing={0.75} sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
      {actions.length === 0 && (
        <Typography variant="caption" color="text.secondary">
          {t('no-actions-in-phase')}
        </Typography>
      )}
      {actions.map((action) => (
        <Box key={action.id} sx={{ height: 40 }}>
          <ActorAction action={action} onClick={() => onClick(action)} />
        </Box>
      ))}
    </Stack>
  );
};

export default CombatActorRoundListItem;
