import React, { FC, useContext } from 'react';
import { useState } from 'react';
import { Box, Button } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../CombatContext';
import type { Action } from '../../api/action.dto';
import type { ActorRound } from '../../api/actor-rounds.dto';
import ActionDialog from '../action-dialogs/ActionDialog';
import ActorRoundDeclarationButtons from './ActorRoundDeclarationButtons';

type ActorActionsProps = {
  actorId: string;
  phases?: number;
  currentPhase?: number;
  onActionClick: (action: Action) => void;
};

// Assign each action to a row so that overlapping actions don't share the same row
function assignRows(actions: Action[], phases: number, currentPhase: number) {
  // Normalize start and effective end (if not finished, draw until currentPhase)
  const items = actions.map((a) => {
    const start = Math.max(1, Math.min(phases, a.phaseStart));
    const rawEnd = a.phaseEnd ?? currentPhase;
    const end = Math.max(start, Math.min(phases, rawEnd));
    return { action: a, start, end };
  });

  // sort by start asc, longer spans first when same start
  items.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));

  const rows: { end: number }[] = [];
  const placement: { action: Action; start: number; end: number; row: number }[] = [];

  items.forEach((it) => {
    // find first row where this fits (start > row.end)
    let placed = false;
    for (let r = 0; r < rows.length; r++) {
      if (it.start > rows[r].end) {
        // place here
        placement.push({ action: it.action, start: it.start, end: it.end, row: r });
        rows[r].end = it.end;
        placed = true;
        break;
      }
    }
    if (!placed) {
      // new row
      const r = rows.length;
      rows.push({ end: it.end });
      placement.push({ action: it.action, start: it.start, end: it.end, row: r });
    }
  });

  return { placement, rowsCount: rows.length };
}

const ActorActions: FC<ActorActionsProps> = ({ actorId, phases = 4, currentPhase = phases, onActionClick }) => {
  const { roundActions, actorRounds, characters } = useContext(CombatContext)!;
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const actions = (roundActions || []).filter((a: Action) => a.actorId === actorId);
  const actorRound: ActorRound | undefined = (actorRounds || []).find((r) => r.actorId === actorId);
  const character = (characters || []).find((c) => c.id === actorId);

  if (!actorRound) return <>Loading...</>;

  const { placement, rowsCount } = assignRows(actions, phases, currentPhase);
  const isDead = actorRound.effects.some((e) => e.status === 'dead');

  const rowHeight = 40; // px
  const gap = 8;
  const declareHeight = 36; // px for declare button row

  const getActionName = (action: Action) => {
    let name = '';
    if (action.maneuver) {
      name = t(action.maneuver?.modifiers?.skillId || 'maneuver');
    } else if (action.movement) {
      name = `${t('movement')}${action.movement.calculated?.distanceAdjusted ? `: ${action.movement.calculated.distanceAdjusted}` : ''}`;
    } else {
      name = t(action.actionType);
    }
    return action.freeAction ? `${t('Free ')} ${name}` : name;
  };

  if (isDead) return <></>;

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Box
          sx={{
            position: 'relative',
            height: (rowsCount + 1) * (rowHeight + gap),
            border: '1px solid rgba(0,0,0,0.06)',
            borderRadius: 1,
            p: 1,
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          {placement.map((p) => {
            const leftPercent = ((p.start - 1) / phases) * 100;
            const widthPercent = ((p.end - p.start + 1) / phases) * 100;
            const topPx = p.row * (rowHeight + gap);
            const completed = p.action.status === 'completed';

            return (
              <Box
                key={p.action.id}
                sx={{
                  position: 'absolute',
                  left: `${leftPercent}%`,
                  top: `${topPx}px`,
                  width: `calc(${widthPercent}% - ${gap}px)`,
                  height: `${rowHeight}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                }}
              >
                <ActorAction action={p.action} completed={completed} onClick={() => onActionClick(p.action)} />
              </Box>
            );
          })}
          {Array.from({ length: phases }, (_, i) => {
            const leftPercent = (i / phases) * 100;
            const widthPercent = 100 / phases;
            const topPx = rowsCount * (rowHeight + gap);
            return (
              <Box
                key={`declare-${i}`}
                sx={{
                  position: 'absolute',
                  left: `${leftPercent}%`,
                  top: `${topPx}px`,
                  width: `calc(${widthPercent}% - ${gap}px)`,
                  height: `${declareHeight}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                }}
              >
                {i + 1 === currentPhase && (
                  <ActorRoundDeclarationButtons actorRound={actorRound} currentPhase={currentPhase} />
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
      {selectedAction && actorRound && character && (
        <ActionDialog
          action={selectedAction}
          actorRound={actorRound}
          character={character}
          open={resolveDialogOpen}
          onClose={() => {
            setResolveDialogOpen(false);
            setSelectedAction(null);
          }}
        />
      )}
    </>
  );
};

const ActorAction: FC<{ action: Action; completed: boolean; onClick: () => void }> = ({
  action,
  completed,
  onClick,
}) => {
  const getActionName = (action: Action) => {
    let name = '';
    if (action.maneuver) {
      name = t(action.maneuver?.modifiers?.skillId || 'maneuver');
    } else if (action.movement) {
      name = `${t('movement')}${action.movement.calculated?.distanceAdjusted ? `: ${action.movement.calculated.distanceAdjusted}` : ''}`;
    } else {
      name = t(action.actionType);
    }
    return action.freeAction ? `${t('Free ')} ${name}` : name;
  };

  return (
    <Button
      fullWidth
      variant={completed ? 'contained' : 'contained'}
      color={completed ? 'secondary' : 'primary'}
      onClick={onClick}
      sx={{
        height: '100%',
        textTransform: 'none',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        color: completed ? 'secondary.contrastText' : 'primary.contrastText',
      }}
    >
      {getActionName(action)}
      {completed ? undefined : '...'}
    </Button>
  );
};

export default ActorActions;
