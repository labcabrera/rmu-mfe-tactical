import React, { Dispatch, FC, SetStateAction, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, TextField } from '@mui/material';
import Grid from '@mui/material/Grid';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { Action, ActionAttack, updateAttackRoll, updateCriticalRoll } from '../../../api/actions';
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

  const onUpdateCriticalRollClick = (criticalKey: string) => {
    let roll = undefined;
    try {
      roll = attack.roll!.criticalRolls[criticalKey];
    } catch (e) {
      showError('Critical roll is not defined');
      console.log(e);
      return;
    }
    updateCriticalRoll(action.id, attack.modifiers.attackName, criticalKey, roll)
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
          <>
            <Grid size={2} key={index}>
              <TextField label={t('status')} value={critical.status} variant="standard" fullWidth />
            </Grid>
            <Grid size={1} key={index}>
              <TextField label={t('critical-type')} value={critical.criticalType} variant="standard" fullWidth />
            </Grid>
            <Grid size={1} key={index}>
              <TextField label={t('critical-severity')} value={critical.criticalSeverity} variant="standard" fullWidth />
            </Grid>
            <Grid size={1} key={index}>
              <TextField label={t('critical-roll')} value={0} variant="standard" fullWidth />
            </Grid>
            <Grid size={1} key={index}>
              <NumericInput label={t('new-roll')} value={0} onChange={(e) => onUpdateCriticalRoll(critical.key, e)} />
            </Grid>
            <Grid size={2} key={index}>
              <Button variant="outlined" onClick={() => onUpdateCriticalRollClick(critical.key)}>
                Critical roll
              </Button>
            </Grid>
            <Grid size={12} key={index}></Grid>
            <pre>{JSON.stringify(critical, null, 2)}</pre>
          </>
        ))}
    </Grid>
  );
};

export default ResolveAttackFormRoll;
