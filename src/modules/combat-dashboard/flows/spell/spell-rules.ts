import { ActionSpell, SpellFailurePp } from '../../../api/action.dto';
import { ActorRound, ActorRoundAttack } from '../../../api/actor-rounds.dto';
import { POWER_RECYCLING, traitTier } from '../../../services/combat-talents-service';

/** Power points a spell failure result suggests (the API applies the same rule when none is given). */
export const failurePowerPoints = (kind: SpellFailurePp, spellPp: number, current: number): number => {
  const byKind: Record<SpellFailurePp, number> = {
    none: 0,
    one: 1,
    'half-down': Math.floor(spellPp / 2),
    'half-up': Math.ceil(spellPp / 2),
    normal: spellPp,
    double: spellPp * 2,
    triple: spellPp * 3,
    all: current,
  };
  return Math.max(0, Math.min(byKind[kind], current));
};

/** Targets a bolt strikes: 1, or 1 + the tier of the caster's Scope Skills for the list (workspace spec 077). */
export const boltMaxTargets = (spell: ActionSpell): number =>
  spell.attack?.kind === 'bolt' ? Math.max(1, spell.attack.maxTargets ?? 1) : 1;

/**
 * Power points Power Recycling would save of a failed cast (workspace spec 077, decision C3): half, rounded for the
 * caster (I), or all (II), of a failure or no-effect. The API applies it when the cast is applied.
 */
export const recycledPowerPoints = (actorRound: ActorRound, spell: ActionSpell, base: number): number => {
  const tier = traitTier(actorRound, POWER_RECYCLING);
  if (!tier || (spell.result !== 'failure' && spell.result !== 'no-effect')) return 0;
  const charged = tier >= 2 ? 0 : Math.floor(Math.max(0, base) / 2);
  return Math.max(0, base) - charged;
};

/**
 * The attack of a bolt or ball spell read as ranged weapons (spec 030, phase 4): a bolt strikes one target, a ball
 * makes one attack per target in its area (`fire-ball-1`, `fire-ball-2`…), up to the other actors of the round. A bolt
 * with Scope Skills strikes up to 1 + tier targets (workspace spec 077), named like the attacks of a ball.
 */
export const spellSourceAttacks = (spell: ActionSpell, others: number): ActorRoundAttack[] => {
  const attack = spell.attack!;
  const bolts = Math.min(boltMaxTargets(spell), Math.max(1, others));
  const count = attack.kind === 'ball' ? Math.max(1, others) : bolts;
  return Array.from({ length: count }, (_, i) => ({
    attackName: attack.kind === 'ball' || count > 1 ? `${attack.attackName}-${i + 1}` : attack.attackName,
    baseBo: attack.bo,
    currentBo: attack.bo,
    type: 'ranged',
    attackTable: attack.attackTable,
    fumbleTable: attack.fumbleTable,
    attackSize: attack.attackSize,
    fumble: attack.fumble,
    canThrow: false,
    ranges: attack.ranges,
  }));
};
