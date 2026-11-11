import { Action, ActionAttack, Critical } from '../../api/action.dto';

/** One resolved attack of the combat. A fumble hurts the attacker, not the target: it adds no damage caused. */
export type AttackRow = {
  key: string;
  round: number;
  phase: number;
  attackerId: string;
  targetId: string;
  attackName: string;
  rollTotal: number | null;
  tableDamage: number;
  criticalDamage: number;
  damage: number;
  /** Criticals already rolled. */
  criticals: Critical[];
  fumble: boolean;
};

/** What one actor caused over the whole combat. */
export type ActorDamage = {
  actorId: string;
  attacks: number;
  hits: number;
  fumbles: number;
  tableDamage: number;
  criticalDamage: number;
  damage: number;
  criticals: Critical[];
};

const attackRow = (action: Action, attack: ActionAttack, index: number): AttackRow => {
  const fumble = !!attack.results?.fumble;
  const criticals = fumble ? [] : (attack.results?.criticals ?? []).filter((critical) => !!critical.result);
  const tableDamage = fumble ? 0 : (attack.results?.attackTableEntry?.damage ?? 0);
  const criticalDamage = criticals.reduce((total, critical) => total + (critical.result?.damage ?? 0), 0);
  return {
    key: `${action.id}-${index}`,
    round: action.round,
    phase: action.phaseEnd ?? action.phaseStart,
    attackerId: action.actorId,
    targetId: attack.modifiers.targetId,
    attackName: attack.attackName,
    rollTotal: attack.calculated?.rollTotal ?? null,
    tableDamage,
    criticalDamage,
    damage: tableDamage + criticalDamage,
    criticals,
    fumble,
  };
};

/** Every attack of the completed actions, in the order of the combat. */
export const attackRows = (actions: Action[]): AttackRow[] =>
  actions
    .filter((action) => action.status === 'completed')
    .flatMap((action) =>
      (action.attacks ?? []).flatMap((attack, index) => (attack.results ? [attackRow(action, attack, index)] : []))
    )
    .sort((a, b) => a.round - b.round || a.phase - b.phase);

/** The attacks added up by attacker, the one that caused the most damage first. */
export const damageByActor = (rows: AttackRow[]): ActorDamage[] => {
  const byActor = new Map<string, ActorDamage>();
  rows.forEach((row) => {
    const current = byActor.get(row.attackerId) ?? {
      actorId: row.attackerId,
      attacks: 0,
      hits: 0,
      fumbles: 0,
      tableDamage: 0,
      criticalDamage: 0,
      damage: 0,
      criticals: [],
    };
    byActor.set(row.attackerId, {
      ...current,
      attacks: current.attacks + 1,
      hits: current.hits + (row.damage > 0 || row.criticals.length > 0 ? 1 : 0),
      fumbles: current.fumbles + (row.fumble ? 1 : 0),
      tableDamage: current.tableDamage + row.tableDamage,
      criticalDamage: current.criticalDamage + row.criticalDamage,
      damage: current.damage + row.damage,
      criticals: [...current.criticals, ...row.criticals],
    });
  });
  return [...byActor.values()].sort((a, b) => b.damage - a.damage);
};

/** The part of `max` that `value` fills in a bar, from 0 to 1; nothing when there is no scale. */
export const barShare = (value: number, max: number | null | undefined): number =>
  max && max > 0 ? Math.min(1, Math.max(0, value) / max) : 0;
