import React, { Dispatch, FC, Fragment, SetStateAction, useContext } from 'react';
import { Grid, Typography } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { ActionAttack, ActionAttackModifiers, AttackDeclaration } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import OffensiveBonusSelector from './OffensiveBonusSelector';
import TargetSelector from './TargetSelector';

const MeleeAttackSelectAttacks: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  actorRound: ActorRound;
}> = ({ formData, setFormData, actorRound }) => {
  return <AttackList actorRound={actorRound} formData={formData} setFormData={setFormData} />;
};

export default MeleeAttackSelectAttacks;

const AttackList: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  actorRound: ActorRound;
}> = ({ formData, setFormData, actorRound }) => {
  const { actorRounds, roundActions } = useContext(CombatContext);
  const selected = formData.attacks || [];
  const paceOrder = ['creep', 'walk', 'jog', 'run', 'sprint', 'dash'];

  const findAttack = (attackName: string) => selected.find((a) => a.attackName === attackName);

  const findActorRound = (actorRoundId: string | null | undefined): ActorRound | undefined =>
    (actorRounds || []).find((ar) => ar.id === actorRoundId);

  const hasStatus = (actorRound: ActorRound, status: string): boolean => {
    return actorRound.effects?.some((se) => se.status === status);
  };

  const findSourceMaxPace = (): string => {
    const actions = (roundActions || []).filter(
      (ra) => ra.actorId === actorRound.actorId && ra.actionType === 'movement'
    );
    if (!actions || actions.length === 0) return 'creep';
    const paces = actions
      .map((a) => a.movement?.modifiers?.pace)
      .filter((p): p is string => typeof p === 'string' && p !== '');
    if (paces.length === 0) return 'creep';
    const valid = Array.from(new Set(paces)).filter((p) => paceOrder.includes(p));
    if (valid.length === 0) return paces[0];

    valid.sort((a, b) => paceOrder.indexOf(b) - paceOrder.indexOf(a));
    return valid[0];
  };

  const handleTargetChange = (attackName: string, targetId: string | null) => {
    const normalizedTargetId = targetId === '' ? null : targetId;
    const target = normalizedTargetId ? findActorRound(normalizedTargetId) : undefined;
    const exists = findAttack(attackName);
    const maxTargetPace = findSourceMaxPace();
    if (!exists) return;
    const hasShield = target && false;
    const isProne = target && hasStatus(target as ActorRound, 'prone');
    const isStunned = target && hasStatus(target as ActorRound, 'stunned');
    const isSurprised = target && hasStatus(target as ActorRound, 'surprised');
    const isOffHand = attackName === 'offHand';
    const pace = maxTargetPace;

    const newSelected = selected.map((a) =>
      a.attackName === attackName
        ? {
            ...a,
            modifiers: {
              ...a.modifiers,
              targetId: normalizedTargetId,
              disabledShield: target ? !hasShield : a.modifiers?.disabledShield,
              stunnedFoe: target ? isStunned && !isSurprised : a.modifiers?.stunnedFoe,
              surprisedFoe: target ? isSurprised : a.modifiers?.surprisedFoe,
              proneTarget: target ? isProne : a.modifiers?.proneTarget,
              offHand: isOffHand,
              pace: target ? pace : a.modifiers?.pace,
            },
          }
        : a
    );

    setFormData((prev) => ({ ...prev, attacks: newSelected }));
  };

  const handleBoChange = (attackName: string, bo: number) => {
    const exists = findAttack(attackName);
    let newSelected: ActionAttack[];
    if (exists) {
      newSelected = selected.map((a) =>
        a.attackName === attackName ? { ...a, modifiers: { ...a.modifiers, bo } } : a
      );
    }
    setFormData({ ...formData, attacks: newSelected });
  };

  if (!actorRound || !actorRound.attacks) {
    return <Typography>No attacks available</Typography>;
  }

  const displayed = formData.attacks && formData.attacks.length > 0 ? formData.attacks : [];

  return (
    <>
      {displayed.length === 0 ? (
        <Typography variant="body2">No attacks selected</Typography>
      ) : (
        displayed.map((attack, index) => {
          const def = (actorRound.attacks || []).find((a) => a.attackName === attack.attackName);
          const existing = findAttack(attack.attackName);
          const modifiers =
            existing?.modifiers ??
            ({
              targetId: null,
              bo: def?.currentBo || 0,
            } as ActionAttackModifiers);

          return (
            <Fragment key={attack.attackName || index}>
              <Typography variant="h6">{t(def?.attackName || attack.attackName)}</Typography>
              <Grid container spacing={1} alignItems="center">
                <Grid size={2}>
                  {t(def?.attackTable || '')} {def ? `+${def.currentBo}` : ''}
                </Grid>
                <Grid size={4}>
                  <OffensiveBonusSelector
                    value={modifiers.bo}
                    max={def?.currentBo || 0}
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
        })
      )}
    </>
  );
};
