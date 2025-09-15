import React, { Dispatch, FC, Fragment, SetStateAction, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Stack, TextField, Grid } from '@mui/material';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { Action, ActionAttack, updateAttackRoll, updateCriticalRoll } from '../../../api/actions';
import Effect from '../../../shared/generic/Effect';
import { NumericInput } from '../../../shared/inputs/NumericInput';
import SelectLocation from '../../../shared/selects/SelectLocation';
import ResolveAttackInfo from './ResolveAttackInfo';

const ResolveAttackFormRoll: FC<{
  formData: ActionAttack;
  setFormData: Dispatch<SetStateAction<ActionAttack>>;
  action: Action;
  index: number;
}> = ({ formData, setFormData, action, index }) => {
  const { updateAction } = useContext(CombatContext);
  const { showError } = useError();
  const { t } = useTranslation();

  const attack = formData.attacks[index];
  const roll = attack.roll?.roll || 0;
  const location = attack.roll?.location || null;

  const handleRollClick = () => {
    const attackName = attack.modifiers.attackName;
    updateAttackRoll(action.id, attackName, roll, location)
      .then((updatedAction) => {
        const newFormData = { attacks: updatedAction.attacks, parries: updatedAction.parries };
        updateAction(updatedAction);
        //TODO fix types when model is updated
        setFormData(newFormData as any);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError('An unknown error occurred');
      });
  };

  const getCriticalRoll = (criticalKey: string): number | undefined => {
    let roll: number | undefined;
    try {
      roll = attack.roll!.criticalRolls[criticalKey];
    } catch (e) {
      console.error(e);
    }
    return roll;
  };

  const onUpdateCriticalRollClick = (criticalKey: string) => {
    updateCriticalRoll(action.id, attack.modifiers.attackName, criticalKey, getCriticalRoll(criticalKey)!)
      .then((updatedAction) => {
        const newFormData = { attacks: updatedAction.attacks, parries: undefined };
        updateAction(updatedAction);
        //TODO fix types when model is updated
        setFormData(newFormData as any);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError('An unknown error occurred');
      });
  };

  if (!formData || !formData.attacks || formData.attacks.length <= index) return <div>Loading...</div>;

  const updateRoll = (value: number) => {
    const updated = { ...formData };
    if (updated.attacks && updated.attacks[index]) {
      if (!updated.attacks[index].roll) {
        updated.attacks[index].roll = { roll: null, location: null };
      } else {
        updated.attacks[index].roll = { ...updated.attacks[index].roll };
      }
      updated.attacks[index].roll.roll = value;
      setFormData(updated);
    }
  };

  const onUpdateCriticalRoll = (criticalKey: string, roll: number) => {
    const updated = { ...formData };
    if (updated.attacks && updated.attacks[index]) {
      if (!updated.attacks[index].roll) {
        updated.attacks[index].roll = { roll: null, location: null };
      } else {
        updated.attacks[index].roll = { ...updated.attacks[index].roll };
      }
      updated.attacks[index].roll.criticalRolls = {
        ...updated.attacks[index].roll.criticalRolls,
        [criticalKey]: roll,
      };
      setFormData(updated);
    }
  };

  const updateLocation = (value: string | null) => {
    const updated = { ...formData };
    if (updated.attacks && updated.attacks[index]) {
      if (!updated.attacks[index].roll) {
        updated.attacks[index].roll = { roll: null, location: null };
      } else {
        updated.attacks[index].roll = { ...updated.attacks[index].roll };
      }
      updated.attacks[index].roll.location = value;
      setFormData(updated);
    }
  };

  return (
    <Grid container spacing={2} sx={{ marginTop: 1, marginBottom: 1 }}>
      <ResolveAttackInfo attack={formData.attacks[index]} />
      <Grid size={2}>
        <NumericInput label={t('attack-roll')} value={attack.roll?.roll || 0} onChange={(e) => updateRoll(e)} />
      </Grid>
      <Grid size={2}>
        <SelectLocation value={attack.roll?.location || null} onChange={(e) => updateLocation(e.target.value)} />
      </Grid>
      <Grid size={2}>
        <Button onClick={() => handleRollClick()} variant="outlined">
          {t('roll-attack')}
        </Button>
      </Grid>
      <Grid size={12}></Grid>
      {attack.results && attack.results.attackTableEntry && (
        <>
          <Grid size={2}>
            <TextField label={t('attack-table-result')} value={attack.results.attackTableEntry.text} variant="standard" fullWidth />
          </Grid>
          <Grid size={12}></Grid>
        </>
      )}
      <Grid size={12}>Criticals</Grid>
      {attack.results &&
        attack.results.criticals &&
        attack.results.criticals.map((critical: any, index: number) => (
          <Fragment key={index}>
            <Grid size={1}>
              <TextField label={t('critical-type')} value={critical.criticalType} variant="standard" fullWidth />
            </Grid>
            <Grid size={1}>
              <TextField label={t('critical-severity')} value={critical.criticalSeverity} variant="standard" fullWidth />
            </Grid>
            <Grid size={1}>
              <NumericInput label={t('roll')} value={getCriticalRoll(critical.key)} onChange={(e) => onUpdateCriticalRoll(critical.key, e)} />
            </Grid>
            <Grid size={2}>
              <Button variant="outlined" onClick={() => onUpdateCriticalRollClick(critical.key)}>
                Critical roll
              </Button>
            </Grid>
            <Grid size={12}></Grid>
            <Grid size={1}></Grid>
            <Grid size={11}>{critical.result?.text || ''}</Grid>
            <Grid size={1}></Grid>
            <Grid size={11}>
              <Stack direction="row" spacing={1}>
                {critical.result && critical.result.damage > 0 && <Effect effect={'dmg'} value={critical.result.damage} />}
                {critical.result.effects &&
                  critical.result.effects.length > 0 &&
                  critical.result.effects.map((effect, effectIndex) => (
                    <Effect key={effectIndex} effect={effect.status} rounds={effect.rounds} value={effect.value} />
                  ))}
              </Stack>
            </Grid>
            <Grid size={12}></Grid>
          </Fragment>
        ))}
    </Grid>
  );
};

export default ResolveAttackFormRoll;
