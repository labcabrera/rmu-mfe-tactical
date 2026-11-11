import type { TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';

/** A finished game is read-only: it only admits reading and applying its outcome (spec 013, §3). */
export const isGameFinished = (game: TacticalGame | null | undefined): boolean => game?.status === 'finished';

/** The game is in progress and the displayed round is the current one: actors and actions can be changed. */
export const isRoundEditable = (game: TacticalGame | null | undefined, displayRound: number | null): boolean =>
  !!game && game.status === 'in_progress' && displayRound === game.round;
