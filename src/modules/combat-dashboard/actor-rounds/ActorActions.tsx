import React, { FC, useContext } from 'react';
import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Box, Button } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../CombatContext';
import type { Action } from '../../api/action.dto';
import type { ActorRound } from '../../api/actor-rounds.dto';
import ActionDialog from '../action-dialogs/ActionDialog';
import DeclareActionDialog from '../action-dialogs/DeclareActionDialog';

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
  const [declareActionDialogOpen, setDeclareActionDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const actions = (roundActions || []).filter((a: Action) => a.actorId === actorId);
  const actorRound: ActorRound | undefined = (actorRounds || []).find((r) => r.actorId === actorId);
  const character = (characters || []).find((c) => c.id === actorId);
  const { placement, rowsCount } = assignRows(actions, phases, currentPhase);

  const rowHeight = 40; // px
  const gap = 8;
  const declareHeight = 36; // px for declare button row

  const getActionName = (action: Action) => {
    if (action.maneuver) {
      return t(action.maneuver?.modifiers?.skillId || 'maneuver');
    }
    return t(action.actionType);
  };

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
                <Button
                  fullWidth
                  variant={completed ? 'contained' : 'contained'}
                  color={completed ? 'secondary' : undefined}
                  onClick={() => onActionClick(p.action)}
                  sx={{
                    height: '100%',
                    textTransform: 'none',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    bgcolor: completed ? undefined : 'success.dark',
                    color: completed ? undefined : 'common.white',
                    '&:hover': {
                      bgcolor: completed ? undefined : 'success.dark',
                    },
                  }}
                >
                  {getActionName(p.action)}
                </Button>
              </Box>
            );
          })}
          {/* Declare button row rendered inside the same relative box as actions */}
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
                  <Button
                    fullWidth
                    variant={'outlined'}
                    color={'primary'}
                    onClick={() => {
                      if (actorRound) setDeclareActionDialogOpen(true);
                    }}
                    disabled={!actorRound}
                    sx={{
                      height: '100%',
                      textTransform: 'none',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'background.paper',
                    }}
                    aria-label="declare-action"
                  >
                    <AddIcon sx={{ fontSize: 18 }} />
                  </Button>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
      {actorRound && (
        <DeclareActionDialog
          actorRound={actorRound}
          phaseNumber={currentPhase}
          open={declareActionDialogOpen}
          setOpen={setDeclareActionDialogOpen}
        />
      )}
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

export default ActorActions;
