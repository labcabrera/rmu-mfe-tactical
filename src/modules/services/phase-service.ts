/** Phases of a round on the board, in order. */
export const PHASES = ['declare_initiative', 'phase_1', 'phase_2', 'phase_3', 'phase_4', 'upkeep'];

/** Phase number (1-4) of a display phase, or 5 outside the action phases (draws actions to the end). */
export const phaseNumber = (displayPhase: string): number =>
  displayPhase.startsWith('phase_') ? parseInt(displayPhase.replace('phase_', '')) : 5;
