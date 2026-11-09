import { createContext, useContext } from 'react';
import { Action } from '../api/action.dto';
import { ActorRound } from '../api/actor-rounds.dto';

export type CombatPanelValue = {
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

export const CombatPanelContext = createContext<CombatPanelValue | null>(null);

/** The combat panel, when the component is inside it (the actor sheet and the board); null elsewhere. */
export const useOptionalCombatPanel = (): CombatPanelValue | null => useContext(CombatPanelContext);

export const useCombatPanel = (): CombatPanelValue => {
  const value = useContext(CombatPanelContext);
  if (!value) throw new Error('useCombatPanel must be used inside CombatPanelProvider');
  return value;
};
