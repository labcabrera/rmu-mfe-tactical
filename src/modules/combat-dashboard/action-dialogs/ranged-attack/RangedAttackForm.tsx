import React, { FC, useContext, useEffect, useState } from 'react';
import { Button, Grid, Typography } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { applyAttack } from '../../../api/action';
import { Action, ActionAttackModifiers, AttackDeclaration } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import ResolveAttackFormRoll from '../attack/ResolveAttackFormRoll';
import TargetSelector from '../melee-attack/TargetSelector';
import RangedAttackModifiersForm from './RangedAttackModifiersForm';

const RangedAttackForm: FC<{
  actorRound: ActorRound;
  action: Action;
}> = ({ actorRound, action }) => {
  const { refreshActorRounds, updateAction } = useContext(CombatContext);
  const { showError } = useError();

  const [formData, setFormData] = useState<AttackDeclaration>({ attacks: [], parries: [] });

  const selected = formData.attacks || [];

  const findAttack = (attackName: string) => selected.find((a) => a.attackName === attackName);

  const handleTargetChange = (attackName: string, targetId: string | null) => {
    const exists = findAttack(attackName);
    if (!exists) {
      showError(t('attack-not-found'));
      return;
    }
    const newSelected = selected.map((a) =>
      a.attackName === attackName ? { ...a, modifiers: { ...a.modifiers, targetId } } : a
    );
    setFormData({ ...formData, attacks: newSelected });
  };

  const onApply = () => {
    applyAttack(action.id)
      .then((updatedAction) => {
        updateAction(updatedAction);
        refreshActorRounds();
      })
      .catch((err: Error) => showError(err.message));
  };

  useEffect(() => {
    if (action.attacks) {
      setFormData(action as AttackDeclaration);
    }
  }, [action]);

  useEffect(() => {
    if (actorRound && formData) {
      formData.attacks?.forEach((attack) => {
        const matchingAttack = actorRound.attacks?.find((a) => a.attackName === attack.attackName);
        if (!matchingAttack) {
          const newAttacks = formData.attacks?.filter((a) => a.attackName !== attack.attackName) || [];
          setFormData({ ...formData, attacks: newAttacks });
        }
      });
    }
  }, [actorRound, formData]);

  if (!actorRound || (!actorRound.attacks && !action.attacks)) {
    return <Typography>No ranged attacks available</Typography>;
  }

  return (
    <>
      {(action.attacks || []).map((actionAttack, index) => {
        const actorAttack = actorRound.attacks?.find((a) => a.attackName === actionAttack.attackName);
        const existing = findAttack(actionAttack.attackName);
        const modifiers =
          existing?.modifiers ??
          actionAttack.modifiers ??
          ({ targetId: null, bo: actorAttack?.currentBo || 0 } as ActionAttackModifiers);

        const displayTable = actorAttack?.attackTable || '';
        const displayBo = actorAttack?.currentBo ?? actionAttack.modifiers?.bo ?? 0;

        return (
          <div key={index}>
            {existing && actorAttack && !existing.calculated && (
              <>
                <Typography variant="h6">{t(actionAttack.attackName)}</Typography>
                <Grid container spacing={1} alignItems="center">
                  <Grid size={2}>
                    {t(displayTable)} +{displayBo}
                  </Grid>
                  <Grid size={10} mb={5}>
                    <TargetSelector
                      value={modifiers.targetId || ''}
                      onChange={(actorId) => handleTargetChange(actionAttack.attackName, actorId)}
                      sourceId={actorRound.actorId}
                    />
                  </Grid>
                </Grid>
                <RangedAttackModifiersForm
                  action={action}
                  attack={actorAttack}
                  formData={formData}
                  setFormData={setFormData}
                  index={selected.findIndex((a) => a.attackName === actionAttack.attackName)}
                />
              </>
            )}
            {existing && actorAttack && existing.calculated && (
              <ResolveAttackFormRoll
                formData={formData}
                setFormData={setFormData}
                action={action}
                attack={existing}
                index={index}
              />
            )}
          </div>
        );
      })}
      {action.status !== 'completed' && (
        <Button variant="contained" color="success" onClick={onApply}>
          {t('apply')}
        </Button>
      )}
      <pre>FormData: {JSON.stringify(formData, null, 2)}</pre>
      <pre>Action: {JSON.stringify(action, null, 2)}</pre>
    </>
  );
};

export default RangedAttackForm;
