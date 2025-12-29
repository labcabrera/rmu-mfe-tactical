import React, { Dispatch, FC, Fragment, SetStateAction, useContext } from 'react';
import { Grid, Typography } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { ActionAttack, ActionAttackModifiers, AttackDeclaration } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import type { Character } from '../../../api/characters';
import OffensiveBonusSelector from './OffensiveBonusSelector';
import TargetSelector from './TargetSelector';

const MeleeAttackSelectAttacks: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  actorRound: ActorRound;
  character: Character;
}> = ({ formData, setFormData, actorRound, character }) => {
  return <AttackList actorRound={actorRound} character={character} formData={formData} setFormData={setFormData} />;
};

export default MeleeAttackSelectAttacks;

const AttackList: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  actorRound: ActorRound;
  character: Character;
}> = ({ formData, setFormData, actorRound }) => {
  const { actorRounds, roundActions } = useContext(CombatContext);
  const selected = formData.attacks || [];

  const paceOrder = ['creep', 'walk', 'jog', 'run', 'sprint', 'dash'];

  const findAttack = (attackName: string) => selected.find((a) => a.modifiers.attackName === attackName);

  const findActorRound = (actorId: string): ActorRound => actorRounds.find((ar) => ar.actorId === actorId)!;

  const hasStatus = (actorRound: ActorRound, status: string): boolean => {
    return actorRound.effects?.some((se: any) => se.status === status);
  };

  const findSourceMaxPace = (): string => {
    const actions = (roundActions || []).filter(
      (ra) => ra.actorId === actorRound.actorId && ra.actionType === 'movement'
    );
    if (!actions || actions.length === 0) return 'creep';
    // collect pace values from movement actions
    const paces = actions
      .map((a) => a.movement?.modifiers?.pace)
      .filter((p): p is string => typeof p === 'string' && p !== '');
    if (paces.length === 0) return 'creep';
    // keep only known paces and order by paceOrder (higher index = faster)
    const valid = Array.from(new Set(paces)).filter((p) => paceOrder.includes(p));
    if (valid.length === 0) return paces[0];

    valid.sort((a, b) => paceOrder.indexOf(b) - paceOrder.indexOf(a));
    return valid[0];
  };

  const handleTargetChange = (attackName: string, targetId: string | null) => {
    const normalizedTargetId = targetId === '' ? null : targetId;
    const target = findActorRound(normalizedTargetId);
    const exists = findAttack(attackName);
    const maxTargetPace = findSourceMaxPace();
    let newSelected: ActionAttack[];
    if (exists && target) {
      const hasShield = false; // derive from target when available (placeholder)
      const isProne = hasStatus(target, 'prone');
      const isStunned = hasStatus(target, 'stunned');
      const isSurprised = hasStatus(target, 'surprised');
      const isOffHand = attackName === 'offHand';
      const pace = maxTargetPace;
      newSelected = selected.map((a) =>
        a.modifiers.attackName === attackName
          ? {
              ...a,
              modifiers: {
                ...a.modifiers,
                targetId: normalizedTargetId,
                disabledShield: !hasShield,
                stunnedFoe: isStunned && !isSurprised,
                surprisedFoe: isSurprised,
                proneTarget: isProne,
                offHand: isOffHand,
                pace: pace,
              },
            }
          : a
      );
    } else {
      const baseBo = actorRound.attacks.find((a) => a.attackName === attackName)?.currentBo || 0;
      const modifiers = { attackName, targetId: normalizedTargetId, bo: baseBo } as ActionAttackModifiers;
      newSelected = [...selected, { modifiers, calculated: undefined, roll: undefined, results: undefined }];
    }
    setFormData((prev) => ({ ...prev, attacks: newSelected }));
  };

  const handleBoChange = (attackName: string, bo: number) => {
    const exists = findAttack(attackName);
    let newSelected: ActionAttack[];
    if (exists) {
      newSelected = selected.map((a) =>
        a.modifiers.attackName === attackName ? { ...a, modifiers: { ...a.modifiers, bo } } : a
      );
    } else {
      const modifiers = { attackName, targetId: null, bo } as ActionAttackModifiers;
      newSelected = [...selected, { modifiers, calculated: undefined, roll: undefined, results: undefined }];
    }
    setFormData({ ...formData, attacks: newSelected });
  };

  if (!actorRound || !actorRound.attacks) {
    return <Typography>No attacks available</Typography>;
  }

  return (
    <>
      {actorRound.attacks.map((attack, index) => {
        const existing = findAttack(attack.attackName);
        const modifiers =
          existing?.modifiers ??
          ({
            attackName: attack.attackName,
            targetId: null,
            bo: attack.currentBo || 0,
          } as ActionAttackModifiers);

        return (
          <Fragment key={attack.attackName || index}>
            <Typography variant="h6">{t(attack.attackName)}</Typography>
            <Grid container spacing={1} alignItems="center">
              <Grid size={2}>
                {t(attack.attackTable)} +{attack.currentBo}
              </Grid>
              <Grid size={4}>
                <OffensiveBonusSelector
                  value={modifiers.bo}
                  max={attack.currentBo}
                  onChange={(bo: number) => handleBoChange(attack.attackName, bo)}
                />
              </Grid>
              <Grid size={6}>
                <TargetSelector
                  value={modifiers.targetId || ''}
                  onChange={(actorId) => handleTargetChange(attack.attackName, actorId)}
                  sourceId={(actorRound as any).actorId}
                />
              </Grid>
            </Grid>
          </Fragment>
        );
      })}
    </>
  );
};
