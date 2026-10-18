import { getPhaseAsNumber, TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { Action } from '../api/action.dto';

// Webpack replaces `process.env.NODE_ENV` with the build mode. The repo has no Node types, so declare just that.
declare const process: { env: { NODE_ENV?: string } };

/** Debug panels (raw JSON, TechnicalInfo) are only rendered in development builds. */
export const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Critical code shown to the user: type then severity ("PB" is a B severity Puncture critical). This is the order of
 * the critical tables in rmu-api-attack-tables (`tables/critical/P-B.json`, `GET /critical-tables/{type}/{severity}`).
 */
export const criticalCode = (criticalType?: string | null, criticalSeverity?: string | null): string =>
  `${criticalType || ''}${criticalSeverity || ''}`;

/**
 * Action points an attack declared at `phaseStart` would spend if it were prepared now (same rule as the API's
 * prepare: game phase - phaseStart + 1). `0` outside the action phases or before the action starts.
 */
export const attackActionPoints = (action: Action, game: TacticalGame): number => {
  const gamePhase = getPhaseAsNumber(game);
  if (gamePhase === undefined) return 0;
  return Math.max(0, gamePhase - action.phaseStart + 1);
};
