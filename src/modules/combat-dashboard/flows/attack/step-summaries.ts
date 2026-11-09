import { formatBonus } from '@labcabrera-rmu/rmu-react-shared-lib';
import { TFunction } from 'i18next';
import { Action, ActionAttack } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import { criticalCode } from '../../../services/action-service';
import { AttackKind, declaredValue, fieldsFor, isDeclared, ModifierField } from './modifiers/attack-modifier-fields';

/** At most this many modifiers are named in the summary; the rest are counted (workspace spec 085, 1.5). */
const SHOWN_MODIFIERS = 3;

const modifierText = (field: ModifierField, attack: ActionAttack, kind: AttackKind, t: TFunction) => {
  const value = declaredValue(field, attack.modifiers, kind);
  const label =
    field.kind === 'choice' ? `${t(field.label)}: ${t(String(attack.modifiers[field.name]))}` : t(field.label);
  return value === null ? label : `${label} ${formatBonus(value)}`;
};

/** "Target stunned +20 · Cover: Soft half -20 (+2 more)", or "No modifiers". */
export const modifiersSummary = (
  attacks: ActionAttack[],
  kind: AttackKind,
  t: TFunction,
  attackerTraits: string[] = []
): string => {
  const texts = [
    ...new Set(
      attacks.flatMap((attack) =>
        fieldsFor(kind, attackerTraits)
          // Counted with the called shot
          .filter((field) => field.name !== 'calledShotPenalty' && isDeclared(field, attack.modifiers))
          .map((field) => modifierText(field, attack, kind, t))
      )
    ),
  ];
  if (texts.length === 0) return t('no-modifiers');
  const shown = texts.slice(0, SHOWN_MODIFIERS).join(' · ');
  const rest = texts.length - SHOWN_MODIFIERS;
  return rest > 0 ? `${shown} ${t('and-n-more', { count: rest })}` : shown;
};

/** "Buugug parries 20", "No parry", "Shield: passed". */
export const parrySummary = (action: Action, actorRounds: ActorRound[] | null, t: TFunction): string => {
  const nameOf = (id: string) => actorRounds?.find((ar) => ar.actorId === id)?.actorName ?? '—';
  const parries = (action.parries ?? []).filter((p) => p.parry > 0);
  const parts = parries.map((p) => t('parry-summary', { actor: nameOf(p.actorId), parry: p.parry }));
  (action.attacks ?? []).forEach((attack) => {
    const maneuver = attack.shieldManeuver;
    if (!maneuver?.required || maneuver.passed === null || maneuver.passed === undefined) return;
    parts.push(
      t(maneuver.passed ? 'shield-maneuver-summary-passed' : 'shield-maneuver-summary-failed', {
        actor: nameOf(maneuver.targetId),
      })
    );
  });
  return parts.length > 0 ? parts.join(' · ') : t('parry-summary-none');
};

/** "Attack 92 → 122 · Critical SC 55", "Fumble 03". */
export const rollsSummary = (attacks: ActionAttack[], t: TFunction): string =>
  attacks
    .filter((attack) => attack.roll?.roll !== null && attack.roll?.roll !== undefined)
    .map((attack) => {
      const parts = [
        t('attack-roll-summary', {
          roll: attack.roll!.roll,
          total: attack.calculated?.rollTotal ?? attack.roll!.roll,
        }),
      ];
      (attack.results?.criticals ?? []).forEach((critical) => {
        const roll = attack.roll?.criticalRolls?.[critical.key];
        if (roll === null || roll === undefined) return;
        parts.push(
          t('critical-roll-summary', { critical: criticalCode(critical.criticalType, critical.criticalSeverity), roll })
        );
      });
      const fumble = attack.roll?.fumbleRoll;
      if (fumble !== null && fumble !== undefined) parts.push(t('fumble-roll-summary', { roll: fumble }));
      return parts.join(' · ');
    })
    .join(' · ');
