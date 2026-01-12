import React, { FC, useContext } from 'react';
import { useState } from 'react';
import { Box, Button, Stack } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../CombatContext';
import { useError } from '../../../ErrorContext';
import { createAction } from '../../api/action';
import type { Action } from '../../api/action.dto';
import type { ActorRound } from '../../api/actor-rounds.dto';
import ActionIconButton from '../../shared/buttons/ActionIconButton';
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
  const { game, roundActions, actorRounds, characters, setRoundActions } = useContext(CombatContext)!;
  const [declareActionDialogOpen, setDeclareActionDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const actions = (roundActions || []).filter((a: Action) => a.actorId === actorId);
  const actorRound: ActorRound | undefined = (actorRounds || []).find((r) => r.actorId === actorId);
  const character = (characters || []).find((c) => c.id === actorId);
  const { placement, rowsCount } = assignRows(actions, phases, currentPhase);
  const isDead = actorRound.effects.some((e) => e.status === 'dead');
  const { showError } = useError();

  const rowHeight = 40; // px
  const gap = 8;
  const declareHeight = 36; // px for declare button row

  const getActionName = (action: Action) => {
    if (action.maneuver) {
      return t(action.maneuver?.modifiers?.skillId || 'maneuver');
    }
    return t(action.actionType);
  };

  const onMovementDeclaration = () => {
    createAction({ gameId: game.id, actorId, actionType: 'movement', phaseStart: currentPhase, freeAction: true })
      .then((action) => {
        setRoundActions([...roundActions, action]);
      })
      .catch((err) => showError(err.message));
  };

  const onMeleeAttackDeclaration = () => {
    createAction({ gameId: game.id, actorId, actionType: 'melee_attack', phaseStart: currentPhase, freeAction: true })
      .then((action) => {
        setRoundActions([...roundActions, action]);
      })
      .catch((err) => showError(err.message));
  };

  if (isDead) {
    return <></>;
  }

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
                  color={completed ? 'secondary' : 'primary'}
                  onClick={() => onActionClick(p.action)}
                  sx={{
                    height: '100%',
                    textTransform: 'none',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    color: completed ? 'secondary.contrastText' : 'primary.contrastText',
                  }}
                >
                  {getActionName(p.action)}
                  {completed ? undefined : '...'}
                </Button>
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
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <ActionIconButton
                      imageSrc="/static/images/icons/movement.png"
                      tooltipTitle="Movement"
                      onClick={() => onMovementDeclaration()}
                    />
                    <ActionIconButton
                      imageSrc="/static/images/icons/attack.png"
                      tooltipTitle="Melee attack"
                      onClick={() => onMeleeAttackDeclaration()}
                    />
                    <ActionIconButton
                      imageSrc="/static/images/icons/ranged-attack.png"
                      tooltipTitle="Ranged attack"
                      onClick={() => setDeclareActionDialogOpen(true)}
                    />
                    <ActionIconButton
                      onClick={() => setDeclareActionDialogOpen(true)}
                      ariaLabel="declare-action-image"
                      imageSrc="/static/images/icons/add.png"
                    />
                  </Stack>
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
