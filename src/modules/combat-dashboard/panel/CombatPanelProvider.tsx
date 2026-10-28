import React, { createContext, FC, ReactNode, useContext, useState } from 'react';
import { Stack, Typography } from '@mui/material';
import { ActionTypeChip, SidePanelLayout } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import ActorRoundDialog from '../../actor-round/ActorRoundDialog';
import { ActorRoundTab } from '../../actor-round/tabs/ActorRoundTabs';
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
  /** Opens the full sheet of an actor (spec 045) and selects it in the panel. */
  openActorDetail: (actorRound: ActorRound) => void;
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
 * Side panel of the combat screen, the action palette, the resolution dialog and the actor sheet, shared by the
 * board and the log. The panel only shows actors and actions (their state and results); actions are resolved in
 * the dialog, whose forms need more room, and the whole actor is in its sheet (spec 045).
 */
const CombatPanelProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { game, actorRounds, roundActions, displayRound } = useContext(CombatContext)!;
  const [panel, setPanel] = useState<PanelState>(null);
  const [palette, setPalette] = useState<{ actorRound: ActorRound; anchor: HTMLElement | null } | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  // Spec 045: the actor sheet, and its tab, kept while the dashboard is open (decision 6).
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<ActorRoundTab>('summary');

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
  const openActorDetail = (actorRound: ActorRound) => {
    openActor(actorRound);
    setDetailId(actorRound.id);
  };
  // An actor round of another round is another id: the sheet closes when the displayed round changes.
  const detailActorRound = detailId ? actorRounds?.find((ar) => ar.id === detailId) : undefined;
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
  // selected actor's action waiting for input (or opens its first action), A opens its action palette, F its sheet.
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
  useShortcut(['f', 'F'], () => {
    if (!panelActorRound) return false;
    openActorDetail(panelActorRound);
  });
  // The sheet moves in board order too, and the panel follows it (decision 5).
  const moveDetail = (step: number) => {
    const index = order.findIndex((ar) => ar.id === detailId);
    if (index < 0 || order.length === 0) return;
    openActorDetail(order[(index + step + order.length) % order.length]);
  };
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
        onOpenDetail={() => openActorDetail(panelActorRound)}
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
      value={{
        selectedActorRoundId: panelActorRound?.id ?? null,
        openActor,
        openActorDetail,
        openAction,
        resolveAction,
        openDeclare,
      }}
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
      <ActorRoundDialog
        actorRound={detailActorRound}
        tab={detailTab}
        onTabChange={setDetailTab}
        onNavigate={moveDetail}
        onClose={() => setDetailId(null)}
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
