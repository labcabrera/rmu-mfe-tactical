import React, { Dispatch, FC, SetStateAction, useContext } from 'react';
import { Button, Grid, Typography } from '@mui/material';
import { CategorySeparator } from '@labcabrera-rmu/rmu-react-shared-lib';
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
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
}> = ({ actorRound, action, formData, setFormData }) => {
  const { refreshActorRounds, updateAction } = useContext(CombatContext)!;
  const { showError } = useError();
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

  if (!formData) return <p>Loading...</p>;

  if (!actorRound || (!actorRound.attacks && !action.attacks)) {
    return <Typography>No ranged attacks available</Typography>;
  }

  return (
    <>
      {(action.attacks || []).map((actionAttack, index) => {
        const actorAttack = actorRound.attacks?.find((a) => a.attackName === actionAttack.attackName);
        const existingAttack = findAttack(actionAttack.attackName);
        const modifiers =
          existingAttack?.modifiers ??
          actionAttack.modifiers ??
          ({ targetId: null, bo: actorAttack?.currentBo || 0 } as ActionAttackModifiers);
        const displayTable = actorAttack?.attackTable || '';
        const displayBo = actorAttack?.currentBo ?? actionAttack.modifiers?.bo ?? 0;

        return (
          <div key={index}>
            {existingAttack && actorAttack && !existingAttack.calculated && (
              <>
                <CategorySeparator text={t(actionAttack.attackName)} />
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
            {existingAttack && actorAttack && existingAttack.calculated && (
              <ResolveAttackFormRoll
                formData={formData}
                setFormData={setFormData}
                action={action}
                attack={existingAttack}
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
    </>
  );
};

export default RangedAttackForm;
