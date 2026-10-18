// Columns of the round board (header and rows): actor, initiative, declaration, phases 1-4, effects.
// The minimums keep every cell readable; below them the board scrolls horizontally (tablets).
export const ROUND_GRID_COLUMNS =
  'minmax(280px, 6fr) minmax(96px, 2fr) minmax(96px, 3fr) repeat(4, minmax(80px, 3fr)) minmax(180px, 9fr)';
export const ROUND_GRID_MIN_WIDTH = 1060;

export const PHASES = ['declare_initiative', 'phase_1', 'phase_2', 'phase_3', 'phase_4', 'upkeep'];

/** Phase number (1-4) of a display phase, or 5 outside the action phases (draws actions to the end). */
export const phaseNumber = (displayPhase: string): number =>
  displayPhase.startsWith('phase_') ? parseInt(displayPhase.replace('phase_', '')) : 5;
