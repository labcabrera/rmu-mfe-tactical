import { useContext, useEffect, useState } from 'react';
import { CombatContext } from '../../../../../CombatContext';
import { Action, ActionAttack, AttackDeclaration, ProtectPosition } from '../../../../api/action.dto';
import { ActorRound, ActorRoundAttack } from '../../../../api/actor-rounds.dto';
import {
  actorRoundHasEffect,
  findMaxActorRoundPace,
  isActorRoundDisabled,
  isActorRoundProne,
  isActorRoundStunned,
} from '../../../../services/actor-round-service';
import { reactionWeapons } from '../../../../services/combat-talents-service';

export type AttackKind = 'melee' | 'ranged';

const NEUTRAL = {
  positionalSource: 'none',
  positionalTarget: 'none',
  cover: 'none',
  restrictedQuarters: 'none',
  calledShot: 'none',
};

const newAttack = (attack: ActorRoundAttack, kind: AttackKind, pace: string, fixedOb?: number | null): ActionAttack =>
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
      ...(kind === 'ranged' && { attackerInMelee: false, proneSource: false, ambush: false }),
    },
  }) as ActionAttack;

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
  const { actorRounds, roundActions } = useContext(CombatContext)!;
  const initial = (): AttackDeclaration => {
    if (action.attacks?.length) return { attacks: action.attacks, parries: action.parries ?? [] };
    const pace = findMaxActorRoundPace(actorRound.actorId, roundActions ?? []);
    // Workspace spec 076: a reaction attacks with a weapon of its talent's specialization, the actor it reacts to
    // already chosen for the first one.
    const reaction = action.reaction;
    // Workspace spec 079, A6: a stray shot attacks with the weapon that missed, at OB 0, the combatant the API chose.
    const strayShot = action.strayShot;
    const weapons =
      sourceAttacks ??
      (strayShot
        ? actorRound.attacks.filter((a) => a.attackName === strayShot.attackName)
        : reaction
          ? reactionWeapons(actorRound, reaction.traitId)
          : actorRound.attacks.filter((a) => a.type === kind && !a.broken));
    const target = strayShot
      ? strayShot.targetActorId
      : reaction
        ? actorReactionTarget(action, roundActions ?? [])
        : undefined;
    const fixedOb = strayShot ? 0 : reaction?.obOverride;
    return {
      // A weapon broken in the game cannot attack (spec 019): the API rejects it.
      attacks: weapons.map((a, index) => {
        const attack = newAttack(a, kind, pace, fixedOb);
        return index === 0 && target ? { ...attack, modifiers: { ...attack.modifiers, targetId: target } } : attack;
      }),
      parries: action.parries ?? [],
    };
  };
  const [formData, setFormData] = useState<AttackDeclaration>(initial);

  // Once the API holds the attacks (prepared, parried, rolled), the form follows it.
  useEffect(() => {
    if (action.attacks?.length) setFormData({ attacks: action.attacks, parries: action.parries ?? [] });
  }, [action]);

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

  return { formData, setFormData, targeted, selectTarget, setBo, setRange, toggleProtector, setProtectorPosition };
};
