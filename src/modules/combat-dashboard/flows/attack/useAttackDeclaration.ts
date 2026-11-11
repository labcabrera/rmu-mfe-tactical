import { useEffect, useState } from 'react';
import { Action, ActionAttack, AttackDeclaration, ChargeSpeed, ProtectPosition } from '../../../api/action.dto';
import { ActorRound, ActorRoundAttack } from '../../../api/actor-rounds.dto';
import { useCombatGame, useCombatRound } from '../../../combat/combat-context';
import {
  actorRoundHasEffect,
  isActorRoundDisabled,
  isActorRoundProne,
  isActorRoundStunned,
} from '../../../services/actor-round-service';
import { reactionWeapons } from '../../../services/combat-talents-service';
import { chargeFor } from '../../../services/movement-service';
import { phaseNumber } from '../../../services/phase-service';
import { obOnModify } from './attack-flow-rules';
import { overlappingFreeMovementPace } from './free-movement-pace';

export type AttackKind = 'melee' | 'ranged';

const NEUTRAL = {
  positionalSource: 'none',
  positionalTarget: 'none',
  cover: 'none',
  restrictedQuarters: 'none',
  calledShot: 'none',
};

const newAttack = (
  attack: ActorRoundAttack,
  kind: AttackKind,
  pace: string,
  fixedOb?: number | null,
  chargeSpeed: ChargeSpeed = 'none'
): ActionAttack =>
  ({
    attackName: attack.attackName,
    modifiers: {
      targetId: '',
      // Workspace spec 076: a reaction with a fixed OB (Riposte) attacks with it, not with the weapon's OB.
      bo: fixedOb ?? attack.currentBo,
      disabledDB: false,
      disabledShield: false,
      disabledParry: false,
      restrictedParry: false,
      customBonus: 0,
      pace,
      ...NEUTRAL,
      ...(kind === 'melee' && { chargeSpeed }),
      ...(kind === 'ranged' && { attackerInMelee: false, proneSource: false, ambush: false }),
    },
  }) as ActionAttack;

/**
 * Workspace spec 101: the attacks of the form when a prepared attack goes back to its targets and modifiers, with what
 * it had. One that spends the OB of the round keeps its OB while the action holds it reserved, or else what the actor
 * has left (a parry may have lowered it, spec 082): with none it loses its target. The weapons not used can join in.
 * Preparing again drops the parries and the rolls.
 */
export const attacksOnModify = (
  action: Action,
  actorRound: ActorRound,
  weapons: ActorRoundAttack[],
  kind: AttackKind,
  charge: ChargeSpeed,
  fixedOb: number | null | undefined
): ActionAttack[] => {
  const prepared = action.attacks ?? [];
  const pace = prepared[0]?.modifiers.pace ?? 'creep';
  const spendsRoundOb = action.actionType !== 'cast_spell' && !action.reaction && !action.strayShot;
  const kept = prepared.map((attack) => {
    const bo = spendsRoundOb
      ? obOnModify(action, actorRound, attack.attackName, attack.modifiers.bo ?? 0)
      : attack.modifiers.bo;
    const weapon = weapons.find((each) => each.attackName === attack.attackName);
    if (spendsRoundOb && (bo ?? 0) <= 0 && weapon) return newAttack(weapon, kind, pace, undefined, charge);
    return {
      attackName: attack.attackName,
      protectors: attack.protectors,
      protectorPositions: attack.protectorPositions,
      modifiers: { ...attack.modifiers, bo },
    } as ActionAttack;
  });
  const added = weapons
    .filter((weapon) => !prepared.some((attack) => attack.attackName === weapon.attackName))
    .map((weapon) => newAttack(weapon, kind, pace, fixedOb, charge));
  return [...kept, ...added];
};

/** The actor a reaction attacks: the one of the action that triggered it (workspace spec 076). */
const actorReactionTarget = (action: Action, roundActions: Action[]): string | undefined =>
  roundActions.find((each) => each.id === action.reaction?.triggerActionId)?.actorId;

/**
 * Attack declaration of an action (targets, OB, protectors, range and modifiers) until it is prepared; then it
 * follows the action returned by the API (rolls, parries, results). The attacks come from the actor's weapons, or
 * from `sourceAttacks` (the attack of a spell).
 */
export const useAttackDeclaration = (
  action: Action,
  actorRound: ActorRound,
  kind: AttackKind,
  sourceAttacks?: ActorRoundAttack[]
) => {
  const { game } = useCombatGame();
  const { actorRounds, roundActions } = useCombatRound();
  // Table 8-2: the charge comes from the distance moved in the round before the attack; the GM can change it.
  const charge = game ? chargeFor(actorRound, roundActions ?? [], game.round).speed : 'none';
  // Workspace spec 076: a reaction attacks with a weapon of its talent's specialization. Workspace spec 079, A6: a stray
  // shot attacks with the weapon that missed. A spell attacks with its own attack (`sourceAttacks`).
  const sourceWeapons = (): ActorRoundAttack[] =>
    sourceAttacks ??
    (action.strayShot
      ? actorRound.attacks.filter((a) => a.attackName === action.strayShot!.attackName)
      : action.reaction
        ? reactionWeapons(actorRound, action.reaction.traitId)
        : actorRound.attacks.filter((a) => a.type === kind && !a.broken));
  const fixedObOf = () => (action.strayShot ? 0 : action.reaction?.obOverride);
  const initial = (): AttackDeclaration => {
    if (action.attacks?.length) return { attacks: action.attacks, parries: action.parries ?? [] };
    // Workspace spec 080, decision 3: only a free movement made during the attack sets the pace, not one paid with AP
    const pace = overlappingFreeMovementPace(roundActions ?? [], action, game ? phaseNumber(game.phase) : 0) ?? 'creep';
    // Workspace spec 076: a reaction attacks with a weapon of its talent's specialization, the actor it reacts to
    // already chosen for the first one.
    const reaction = action.reaction;
    // Workspace spec 079, A6: a stray shot attacks with the weapon that missed, at OB 0, the combatant the API chose.
    const strayShot = action.strayShot;
    const weapons = sourceWeapons();
    const target = strayShot
      ? strayShot.targetActorId
      : reaction
        ? actorReactionTarget(action, roundActions ?? [])
        : undefined;
    const fixedOb = fixedObOf();
    return {
      // A weapon broken in the game cannot attack (spec 019): the API rejects it.
      attacks: weapons.map((a, index) => {
        const attack = newAttack(a, kind, pace, fixedOb, charge);
        return index === 0 && target ? { ...attack, modifiers: { ...attack.modifiers, targetId: target } } : attack;
      }),
      parries: action.parries ?? [],
    };
  };
  const [formData, setFormData] = useState<AttackDeclaration>(initial);
  const [changing, setChanging] = useState(false);

  // Once the API holds the attacks (prepared, parried, rolled), the form follows it, unless they are being changed.
  useEffect(() => {
    if (action.attacks?.length && !changing) setFormData({ attacks: action.attacks, parries: action.parries ?? [] });
  }, [action, changing]);

  /** Workspace spec 101: back to the targets and modifiers of a prepared attack not applied yet (`attacksOnModify`). */
  const startChange = () => {
    const attacks = attacksOnModify(action, actorRound, sourceWeapons(), kind, charge, fixedObOf());
    setFormData({ attacks, parries: [] });
    setChanging(true);
  };

  const updateAttack = (attackName: string, change: (attack: ActionAttack) => ActionAttack) =>
    setFormData((prev) => ({
      ...prev,
      attacks: prev.attacks.map((a) => (a.attackName === attackName ? change(a) : a)),
    }));

  /** Sets the target and pre-fills what comes from it: its state and whether it can use DB and shield. */
  const selectTarget = (attackName: string, targetId: string) => {
    const target = actorRounds?.find((ar) => ar.actorId === targetId);
    updateAttack(attackName, (attack) => {
      if (!target)
        return { ...attack, modifiers: { ...attack.modifiers, targetId: '' }, protectors: [], protectorPositions: {} };
      const disabled = isActorRoundDisabled(target);
      return {
        ...attack,
        protectors: [],
        protectorPositions: {},
        modifiers: {
          ...attack.modifiers,
          targetId,
          disabledDB: disabled,
          disabledShield: !target.defense.shield || disabled,
          proneTarget: isActorRoundProne(target),
          stunnedFoe: isActorRoundStunned(target),
          surprisedFoe: actorRoundHasEffect(target, ['surprised']),
        },
      };
    });
  };

  const setBo = (attackName: string, bo: number) =>
    updateAttack(attackName, (a) => ({ ...a, modifiers: { ...a.modifiers, bo } }));

  const setRange = (attackName: string, range: number | null) =>
    updateAttack(attackName, (a) => ({ ...a, modifiers: { ...a.modifiers, range } }));

  /** Adds or removes a protector; a new one stands in no particular place (`other`) until its position is set. */
  const toggleProtector = (attackName: string, actorId: string) =>
    updateAttack(attackName, (a) => {
      const protectors = a.protectors ?? [];
      const positions = { ...(a.protectorPositions ?? {}) };
      const removing = protectors.includes(actorId);
      if (removing) delete positions[actorId];
      else positions[actorId] = 'other';
      return {
        ...a,
        protectors: removing ? protectors.filter((p) => p !== actorId) : [...protectors, actorId],
        protectorPositions: positions,
      };
    });

  /** Where a protector stands (Table 9-7c), which sets the OB it loses to protect. */
  const setProtectorPosition = (attackName: string, actorId: string, position: ProtectPosition) =>
    updateAttack(attackName, (a) => ({
      ...a,
      protectorPositions: { ...(a.protectorPositions ?? {}), [actorId]: position },
    }));

  const targeted = formData.attacks.filter((a) => !!a.modifiers?.targetId);

  return {
    formData,
    setFormData,
    targeted,
    selectTarget,
    setBo,
    setRange,
    toggleProtector,
    setProtectorPosition,
    changing,
    startChange,
    endChange: () => setChanging(false),
  };
};
