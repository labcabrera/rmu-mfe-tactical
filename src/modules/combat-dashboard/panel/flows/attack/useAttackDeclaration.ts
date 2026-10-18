import { useContext, useEffect, useState } from 'react';
import { CombatContext } from '../../../../../CombatContext';
import { Action, ActionAttack, AttackDeclaration } from '../../../../api/action.dto';
import { ActorRound, ActorRoundAttack } from '../../../../api/actor-rounds.dto';
import {
  actorRoundHasEffect,
  findMaxActorRoundPace,
  isActorRoundDisabled,
  isActorRoundProne,
  isActorRoundStunned,
} from '../../../../services/actor-round-service';

export type AttackKind = 'melee' | 'ranged';

const NEUTRAL = {
  positionalSource: 'none',
  positionalTarget: 'none',
  cover: 'none',
  dodge: 'none',
  restrictedQuarters: 'none',
  calledShot: 'none',
};

const newAttack = (attack: ActorRoundAttack, kind: AttackKind, pace: string): ActionAttack =>
  ({
    attackName: attack.attackName,
    modifiers: {
      targetId: '',
      bo: attack.currentBo,
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

/**
 * Attack declaration of an action (targets, OB, protectors, range and modifiers) until it is prepared; then it
 * follows the action returned by the API (rolls, parries, results).
 */
export const useAttackDeclaration = (action: Action, actorRound: ActorRound, kind: AttackKind) => {
  const { actorRounds, roundActions } = useContext(CombatContext)!;
  const initial = (): AttackDeclaration => {
    if (action.attacks?.length) return { attacks: action.attacks, parries: action.parries ?? [] };
    const pace = findMaxActorRoundPace(actorRound.actorId, roundActions ?? []);
    return {
      attacks: actorRound.attacks.filter((a) => a.type === kind).map((a) => newAttack(a, kind, pace)),
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
      if (!target) return { ...attack, modifiers: { ...attack.modifiers, targetId: '' }, protectors: [] };
      const disabled = isActorRoundDisabled(target);
      return {
        ...attack,
        protectors: [],
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

  const toggleProtector = (attackName: string, actorId: string) =>
    updateAttack(attackName, (a) => {
      const protectors = a.protectors ?? [];
      return {
        ...a,
        protectors: protectors.includes(actorId) ? protectors.filter((p) => p !== actorId) : [...protectors, actorId],
      };
    });

  const targeted = formData.attacks.filter((a) => !!a.modifiers?.targetId);

  return { formData, setFormData, targeted, selectTarget, setBo, setRange, toggleProtector };
};
