import type { RollModifier } from '@labcabrera-rmu/rmu-react-shared-lib';
import type { KeyValueModifier } from '../api/action.dto';

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
 * A roll breakdown of the API for the shared `RollBreakdown`, which groups by its own groups only: the `senses` group of
 * workspace spec 076 (sense talents, Light Sensitivity) is shown with the situation.
 */
export const breakdownModifiers = (modifiers: KeyValueModifier[]): RollModifier[] =>
  modifiers.map((modifier) => ({ ...modifier, group: modifier.group === 'senses' ? 'situation' : modifier.group }));
