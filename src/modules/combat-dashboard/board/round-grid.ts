// Columns of the round board (header and rows): actor, initiative, declaration, phases 1-4 and, from `lg`,
// effects (below `lg` the effects go into the actor cell). Under the minimums the board scrolls inside its
// own area, with the actor column sticky.
const BASE_COLUMNS = 'minmax(240px, 2.4fr) 150px 128px repeat(4, minmax(110px, 1.2fr))';
export const ROUND_GRID_COLUMNS = `${BASE_COLUMNS} minmax(200px, 1.8fr)`;
export const ROUND_GRID_COLUMNS_NO_EFFECTS = BASE_COLUMNS;
export const ROUND_GRID_MIN_WIDTH = 1220;
export const ROUND_GRID_MIN_WIDTH_NO_EFFECTS = 1010;
