import {
  DISARM_TWO_HANDED_PENALTY,
  disarmDefenseModifier,
  MELEE_COVER_DEFAULT,
  SUBDUAL_UNFAMILIAR_ANATOMY_PENALTY,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActionAttackModifiers } from '../../../../api/action.dto';
import { AttackKind } from './attack-modifier-fields';

/** A fixed line of the roll preview of a special maneuver; its label is `modifier-label-<key>`. */
export type SpecialManeuverRow = { key: string; value: number | null };

/**
 * Fixed values of the special maneuvers of workspace spec 079 the preview can add up: the combatants in the way of a
 * ranged attack (unless a cover is declared, §9.7), the defender's roll and a two-handed weapon of a disarm (Table
 * 9-7a) and an unfamiliar anatomy of a subdual (Table 9-7e). The penalty of the attack table and the skills are only
 * known to the API: its breakdown after Prepare is the reference.
 */
export const specialManeuverPreview = (modifiers: ActionAttackModifiers, kind: AttackKind): SpecialManeuverRow[] => {
  const rows: SpecialManeuverRow[] = [];
  const declaredCover = !!modifiers.cover && modifiers.cover !== 'none';
  if (kind === 'ranged' && (modifiers.meleeCoverActorIds?.length ?? 0) > 0 && !declaredCover)
    rows.push({ key: 'melee-cover', value: MELEE_COVER_DEFAULT });
  if (modifiers.attackMode === 'disarm') {
    rows.push({ key: 'disarm', value: null });
    if (typeof modifiers.disarmDefenseRoll === 'number')
      rows.push({ key: 'disarm-defense', value: disarmDefenseModifier(modifiers.disarmDefenseRoll) });
    if (modifiers.disarmTwoHanded) rows.push({ key: 'disarm-two-handed', value: DISARM_TWO_HANDED_PENALTY });
  }
  if (modifiers.attackMode === 'subdual') {
    rows.push({ key: 'subdual', value: null });
    if (modifiers.unfamiliarAnatomy) rows.push({ key: 'subdual-anatomy', value: SUBDUAL_UNFAMILIAR_ANATOMY_PENALTY });
    if (modifiers.subdualBonus) rows.push({ key: 'subdual-skill', value: modifiers.subdualBonus });
  }
  return rows;
};

/** The attack can be prepared: a disarm needs the total of the defender's roll. */
export const specialManeuversReady = (modifiers: ActionAttackModifiers): boolean =>
  modifiers.attackMode !== 'disarm' || typeof modifiers.disarmDefenseRoll === 'number';
