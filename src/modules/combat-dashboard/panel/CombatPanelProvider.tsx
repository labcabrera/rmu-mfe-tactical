import React, { createContext, FC, ReactNode, useContext, useState } from 'react';
import { Stack, Typography } from '@mui/material';
import { ActionTypeChip, SidePanelLayout } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { Action } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';
import { isActionActionable } from '../../services/ap-service';
import { isGameFinished } from '../../services/game-service';
import { useShortcut } from '../../services/shortcuts';
import { phaseNumber } from '../actor-rounds/round-grid';
import ActionPalette from './ActionPalette';
import ActionResolutionDialog from './ActionResolutionDialog';
import ActionSummaryView from './ActionSummaryView';
import ActorPanelView from './ActorPanelView';

type PanelState = { kind: 'actor'; actorRoundId: string } | { kind: 'action'; actionId: string } | null;

type CombatPanelValue = {
  /** Actor round shown in the panel (its own view, or the actor of the open action). */
  selectedActorRoundId: string | null;
  openActor: (actorRound: ActorRound) => void;
  openAction: (action: Action) => void;
  /** Opens the resolution dialog of an action (and shows it in the panel). */
  resolveAction: (action: Action) => void;
  /** Set while actions can be declared (an action phase of the current round). */
  openDeclare?: (actorRound: ActorRound, anchor: HTMLElement | null) => void;
};

const CombatPanelContext = createContext<CombatPanelValue | null>(null);

export const useCombatPanel = (): CombatPanelValue => {
  const value = useContext(CombatPanelContext);
  if (!value) throw new Error('useCombatPanel must be used inside CombatPanelProvider');
  return value;
};

/**
 * Side panel of the combat screen, the action palette and the resolution dialog, shared by the board and the
 * log. The panel only shows actors and actions (their state and results); actions are resolved in the dialog,
 * whose forms need more room.
 */
const CombatPanelProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { game, actorRounds, roundActions, displayRound } = useContext(CombatContext)!;
  const [panel, setPanel] = useState<PanelState>(null);
  const [palette, setPalette] = useState<{ actorRound: ActorRound; anchor: HTMLElement | null } | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const history = !!game && displayRound !== game.round;
  const currentPhase = game ? phaseNumber(game.phase) : 1;
  // A finished game is read-only (spec 013): nothing is declared or resolved any more.
  const finished = isGameFinished(game);
  const canDeclare = !!game && !history && !finished && game.phase.startsWith('phase_');

  const panelAction = panel?.kind === 'action' ? roundActions?.find((a) => a.id === panel.actionId) : undefined;
  const panelActorRound =
    panel?.kind === 'actor'
      ? actorRounds?.find((ar) => ar.id === panel.actorRoundId)
      : actorRounds?.find((ar) => ar.actorId === panelAction?.actorId);

  const openAction = (action: Action) => setPanel({ kind: 'action', actionId: action.id });
  const openActor = (actorRound: ActorRound) => setPanel({ kind: 'actor', actorRoundId: actorRound.id });
  const resolveAction = (action: Action) => {
    openAction(action);
    setResolvingId(action.id);
  };
  const resolving = resolvingId ? roundActions?.find((a) => a.id === resolvingId) : undefined;
  const resolvingActorRound = actorRounds?.find((ar) => ar.actorId === resolving?.actorId);
  const openDeclare = canDeclare
    ? (actorRound: ActorRound, anchor: HTMLElement | null) => setPalette({ actorRound, anchor })
    : undefined;

  // The next action waiting for input, in board order, after the open one: only those that can be resolved now
  // (ready, optimal) or whose resolution is under way, never the ones still below their minimum AP.
  const nextPending = (current: Action) => {
    const order = (actorRounds ?? []).map((ar) => ar.actorId);
    const pending = (roundActions ?? [])
      .filter((a) => a.id !== current.id && isActionActionable(a))
      .sort((a, b) => order.indexOf(a.actorId) - order.indexOf(b.actorId) || a.phaseStart - b.phaseStart);
    const from = order.indexOf(current.actorId);
    return pending.find((a) => order.indexOf(a.actorId) >= from) ?? pending[0];
  };
  const nextAfterResolving = resolving ? nextPending(resolving) : undefined;

  // Keyboard: J/K (or the arrows once an actor is selected) move between actors, Enter resolves the
  // selected actor's action waiting for input (or opens its first action), A opens its action palette.
  const order = actorRounds ?? [];
  const selectedIndex = panelActorRound ? order.findIndex((ar) => ar.id === panelActorRound.id) : -1;
  const moveSelection = (step: number) => {
    if (order.length === 0) return;
    const index = selectedIndex < 0 ? 0 : (selectedIndex + step + order.length) % order.length;
    openActor(order[index]);
  };
  useShortcut(['j', 'J'], () => moveSelection(1));
  useShortcut(['k', 'K'], () => moveSelection(-1));
  useShortcut(['ArrowDown', 'ArrowUp'], (event) => {
    if (!panelActorRound) return false;
    moveSelection(event.key === 'ArrowDown' ? 1 : -1);
  });
  useShortcut(['Enter'], () => {
    if (!panelActorRound || panelAction || finished) return false;
    const own = (roundActions ?? []).filter((a) => a.actorId === panelActorRound.actorId);
    const target = own.find(isActionActionable) ?? own[0];
    if (!target) return false;
    resolveAction(target);
  });
  useShortcut(['a', 'A'], () => {
    if (!panelActorRound || !openDeclare) return false;
    openDeclare(panelActorRound, null);
  });

  let content: ReactNode = null;
  if (panelAction && panelActorRound) {
    content = (
      <ActionSummaryView
        key={panelAction.id}
        action={panelAction}
        onResolve={() => resolveAction(panelAction)}
        onDeleted={() => openActor(panelActorRound)}
      />
    );
  } else if (panel?.kind === 'actor' && panelActorRound) {
    content = (
      <ActorPanelView
        key={panelActorRound.id}
        actorRound={panelActorRound}
        onOpenAction={openAction}
        onDeclare={openDeclare ? (e) => openDeclare(panelActorRound, e.currentTarget) : undefined}
      />
    );
  }

  const title = panelActorRound && (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
        {panelActorRound.actorName}
      </Typography>
      {panelAction && <ActionTypeChip type={panelAction.actionType} />}
    </Stack>
  );

  return (
    <CombatPanelContext.Provider
      value={{ selectedActorRoundId: panelActorRound?.id ?? null, openActor, openAction, resolveAction, openDeclare }}
    >
      <SidePanelLayout open={!!content} onClose={() => setPanel(null)} title={title} panel={content}>
        {children}
      </SidePanelLayout>
      <ActionPalette
        actorRound={palette?.actorRound ?? null}
        phase={currentPhase}
        anchorEl={palette?.anchor ?? null}
        onClose={() => setPalette(null)}
        // Declared, not resolved: actions are usually resolved later, often in another phase.
        onCreated={(action) => {
          setPalette(null);
          openAction(action);
        }}
      />
      <ActionResolutionDialog
        action={resolving}
        actorRound={resolvingActorRound}
        onClose={() => setResolvingId(null)}
        onDeleted={() => {
          setResolvingId(null);
          if (resolvingActorRound) openActor(resolvingActorRound);
        }}
        onNextPending={nextAfterResolving ? () => resolveAction(nextAfterResolving) : undefined}
      />
    </CombatPanelContext.Provider>
  );
};

export default CombatPanelProvider;
