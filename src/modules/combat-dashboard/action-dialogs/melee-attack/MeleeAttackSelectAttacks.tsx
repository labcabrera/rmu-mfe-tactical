import React, { Dispatch, FC, Fragment, SetStateAction, useContext } from 'react';
import { Button, Grid, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { ActionAttack, AttackDeclaration } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import OffensiveBonusSelector from './OffensiveBonusSelector';
import TargetSelector from './TargetSelector';

const MeleeAttackSelectAttacks: FC<{
  formData: AttackDeclaration;
  actorRound: ActorRound;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  availableAttacks: ActionAttack[];
}> = ({ formData, actorRound, availableAttacks, setFormData }) => {
  const { actorRounds, roundActions } = useContext(CombatContext)!;
  const paceOrder = ['creep', 'walk', 'jog', 'run', 'sprint', 'dash'];

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

  const onAddAttack = (attackName: string) => {
    const available = availableAttacks.find((e) => e.attackName === attackName)!;
    setFormData((prev) => ({
      ...prev,
      attacks: [...prev.attacks, available],
    }));
  };

  const onTargetSelect = (attackName: string, targetId: string) => {
    const targetActorRound = actorRounds!.find((e) => e.actorId === targetId)!;
    const available = availableAttacks.find((e) => e.attackName === attackName)!;

    available.modifiers.targetId = targetId;
    available.modifiers.disabledShield = !targetActorRound.defense.shield;
    //TODO check all status values
    available.modifiers.disabledDB = hasStatus(targetActorRound, 'dead');
    available.modifiers.pace = findSourceMaxPace();
    available.modifiers.proneTarget = hasStatus(targetActorRound, 'prone');
    available.modifiers.stunnedFoe = hasStatus(targetActorRound, 'stunned');
    available.modifiers.surprisedFoe = hasStatus(targetActorRound, 'surprised');

    setFormData((prev) => {
      const exists = prev.attacks.some((e) => e.attackName === attackName);
      return {
        ...prev,
        attacks: exists
          ? prev.attacks.map((a) =>
              a.attackName === attackName ? { ...a, modifiers: { ...a.modifiers, targetId } } : a
            )
          : [...prev.attacks, available],
      };
    });
  };

  const onBoChange = (attackName: string, bo: number) => {
    setFormData((prev) => {
      const attacks = prev.attacks || [];
      const newAttacks = attacks.map((e) =>
        e.attackName === attackName ? { ...e, modifiers: { ...(e.modifiers || {}), bo } } : e
      );
      const next = { ...prev, attacks: newAttacks };
      console.warn('On bo change', attackName, bo, { prev, next });
      return next;
    });
  };

  if (!availableAttacks || availableAttacks.length < 1) return <p>No available melee attacks</p>;

  if (!actorRound || !actorRound.attacks) return <Typography>No attacks available</Typography>;

  return (
    <Grid container spacing={1}>
      <Grid size={12}>
        {availableAttacks.map((attack, index) => {
          return (
            <Button key={index} onClick={() => onAddAttack(attack.attackName)}>
              {attack.attackName}
            </Button>
          );
        })}
      </Grid>
      {formData.attacks.map((attack, index) => {
        const targetId = attack.modifiers.targetId;
        const actorRoundAttack = actorRound.attacks.find((e) => e.attackName === attack.attackName)!;
        const targetActorRound = targetId ? actorRounds?.find((e) => e.actorId === targetId) : null;
        return (
          <Fragment key={index}>
            <Grid size={2}>
              <Stack direction="column"></Stack>
              <Typography variant="h6" color="primary">
                {t(attack.attackName)}
              </Typography>
              <Typography variant="body2" color="secondary">
                {t(actorRoundAttack.attackTable)}: {actorRoundAttack.currentBo} ({actorRoundAttack.baseBo})
              </Typography>
            </Grid>
            <Grid size={3}>
              <TargetSelector
                value={attack.modifiers.targetId}
                sourceId={actorRound.actorId}
                onChange={(e) => onTargetSelect(attack.attackName, e!)}
              />
            </Grid>
            <Grid size={2}>
              {targetActorRound && (
                <>
                  <Typography>{targetActorRound.actorName}</Typography>
                  <Typography>{targetActorRound.defense.bd}</Typography>
                  <Typography>{targetActorRound.defense.at}</Typography>
                </>
              )}
            </Grid>
            {attack.modifiers.targetId && (
              <Grid size={4}>
                <OffensiveBonusSelector
                  value={attack.modifiers.bo || 0}
                  max={actorRoundAttack.currentBo || 0}
                  onChange={(bo) => onBoChange(attack.attackName, bo)}
                />
              </Grid>
            )}
            <Grid size={12}></Grid>
          </Fragment>
        );
      })}
    </Grid>
  );
};

export default MeleeAttackSelectAttacks;
