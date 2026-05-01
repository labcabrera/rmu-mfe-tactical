import React, { Dispatch, FC, SetStateAction, useContext } from 'react';
import { useState } from 'react';
import { Box, Grid } from '@mui/material';
import { CombatContext } from '../../../CombatContext';
import type { Action } from '../../api/action.dto';
import type { ActorRound } from '../../api/actor-rounds.dto';
import ActionDialog from '../action-dialogs/ActionDialog';
import ActorAction from './ActorAction';
import ActorRoundDeclarationButtons from './ActorRoundDeclarationButtons';

export default function ActorActions({
  actorId,
  phases = 4,
  currentPhase = phases,
  onActionClick,
  setDisplayPhase,  
}:{
  actorId: string;
  phases?: number;
  currentPhase?: number;
  onActionClick: (action: Action) => void;
  setDisplayPhase: Dispatch<SetStateAction<string>>;
}) {
  const { roundActions, actorRounds, characters } = useContext(CombatContext)!;
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  
  if (!roundActions || !actorRounds) return <>Loading...</>;
  
  const actions = (roundActions || []).filter((a: Action) => a.actorId === actorId);
  const actorRound: ActorRound = (actorRounds || []).find((r) => r.actorId === actorId)!;
  const character = (characters || []).find((c) => c.id === actorId);
  const { placement, rowsCount } = assignRows(actions, phases, currentPhase);
  const isDead = actorRound.effects.some((e) => e.status === 'dead');

  const rowHeight = 80;
  const gap = 8;
  const declareHeight = 'auto';

  if (isDead) return;

  const gridTemplateColumns = `repeat(${phases}, 1fr)`;
  const gridTemplateRows = `repeat(${rowsCount}, ${rowHeight}px) auto`;

  if(!actions) return <p>Loading...</p>


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

  return (
    <>
      <Box sx={{ width: '100%', height: '100%' }}>
        <Grid
          container
          sx={{
            display: 'grid',
            gridTemplateColumns,
            gridAutoRows: `${rowHeight}px`,
            gridTemplateRows,
            gap: `${gap}px`,
            width: '100%',
            border: '1px solid rgba(0,0,0,0.06)',
            borderRadius: 0,
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          {placement.map((p) => {
            const colStart = p.start;
            const colEnd = p.end + 1;
            const row = p.row + 1;
            const completed = p.action.status === 'completed';

            return (
              <Grid
                key={p.action.id}
                sx={{
                  gridColumn: `${colStart} / ${colEnd}`,
                  gridRow: `${row} / ${row + 1}`,
                  height: `${rowHeight}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ActorAction action={p.action} completed={completed} onClick={() => onActionClick(p.action)} />
              </Grid>
            );
          })}

          {/* Declaration buttons row */}
          {Array.from({ length: phases }, (_, i) => {
            const colStart = i + 1;
            const colEnd = i + 2;
            const row = rowsCount + 1;
            return (
              <Grid
                key={`declare-${i}`}
                sx={{
                  gridColumn: `${colStart} / ${colEnd}`,
                  gridRow: `${row} / ${row + 1}`,
                  height: declareHeight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {i + 1 === currentPhase && (
                  <ActorRoundDeclarationButtons
                    actorRound={actorRound}
                    currentPhase={currentPhase}
                    setDisplayPhase={setDisplayPhase}
                  />
                )}
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {selectedAction && actorRound && character && (
        <ActionDialog
          action={selectedAction}
          actorRound={actorRound}
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

