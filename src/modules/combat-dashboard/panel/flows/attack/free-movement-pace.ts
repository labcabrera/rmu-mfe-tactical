import { Action } from '../../../../api/action.dto';

/** Paces a free movement can take, slowest first (Core Law §8.2). */
const FREE_PACES = ['creep', 'walk', 'jog', 'run'];

/**
 * Workspace spec 080, decision 3: the pace of the free movement that penalizes `action`, the fastest of the resolved
 * free movements of its actor in the round whose phases overlap it. The API works it out again when it resolves the
 * action; this is only to warn before the attack is prepared. Null when no free movement overlaps.
 */
export const overlappingFreeMovementPace = (
  actions: Action[],
  action: Pick<Action, 'actorId' | 'round' | 'phaseStart' | 'phaseEnd'>,
  currentPhase: number
): string | null => {
  const start = action.phaseStart;
  const end = Math.max(start, action.phaseEnd ?? currentPhase);
  let fastest = -1;
  for (const other of actions) {
    if (other.actorId !== action.actorId || other.round !== action.round) continue;
    if (other.actionType !== 'movement' || !other.freeAction || other.status !== 'completed') continue;
    const otherEnd = other.phaseEnd ?? other.phaseStart;
    if (other.phaseStart > end || otherEnd < start) continue;
    fastest = Math.max(fastest, FREE_PACES.indexOf(other.movement?.modifiers?.pace ?? ''));
  }
  return fastest >= 0 ? FREE_PACES[fastest] : null;
};
