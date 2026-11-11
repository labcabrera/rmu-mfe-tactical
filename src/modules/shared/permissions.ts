import type { TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';

/**
 * Spec 072: the masters of the strategic game (and admins) manage a tactical game: edit, delete, finish it and change
 * its roster. The other members read it, and act with the actors of their factions. A game read from an API before
 * spec 072 has no `access`, and the API still decides.
 */
export const canManageTactical = (game: TacticalGame): boolean => game.access === undefined || game.access === 'manage';
