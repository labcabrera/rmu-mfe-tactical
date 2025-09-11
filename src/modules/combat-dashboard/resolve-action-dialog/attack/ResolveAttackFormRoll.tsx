import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, TextField } from '@mui/material';
import Grid from '@mui/material/Grid';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { Action, AttackDto, updateAttackRoll } from '../../../api/actions';
import { NumericInput } from '../../../shared/inputs/NumericInput';
import ResolveAttackInfo from './ResolveAttackInfo';

const ResolveAttackFormRoll: FC<{
  formData: AttackDto;
  setFormData: (data: AttackDto) => void;
  action: Action;
  index: number;
}> = ({ formData, setFormData, action, index }) => {
  const { updateAction } = useContext(CombatContext);
  const { showError } = useError();
  const { t } = useTranslation();

  const attack = formData.attacks[index];

  const handleRollClick = () => {
    const attackName = attack.modifiers.attackName;
    const roll = attack.roll?.roll || 0;

    updateAttackRoll(action.id, attackName, roll, undefined)
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

  if (!formData || !formData.attacks || formData.attacks.length <= index) return <div>Loading...</div>;

  const updateRoll = (value: number) => {
    const updated = { ...formData };
    if (updated.attacks && updated.attacks[index]) {
      if (!updated.attacks[index].roll) {
        updated.attacks[index].roll = { roll: null };
      } else {
        updated.attacks[index].roll = { ...updated.attacks[index].roll };
      }
      updated.attacks[index].roll.roll = value;
      setFormData(updated);
    }
  };

  return (
    <Grid container spacing={2} sx={{ marginTop: 1, marginBottom: 1 }}>
      <ResolveAttackInfo attack={formData.attacks[index]} />
      <Grid size={2}>
        <NumericInput label={t('attack-roll')} value={0} onChange={(e) => updateRoll(e)} />
      </Grid>
      <Grid size={2}>
        <Button onClick={() => handleRollClick()} variant="outlined">
          Roll
        </Button>
      </Grid>
      <Grid size={12}></Grid>
      {attack.results && attack.results.attackTableEntry && (
        <>
          <Grid size={2}>
            <TextField label={t('results')} value={attack.results.attackTableEntry.text} variant="standard" fullWidth />
          </Grid>
          <Grid size={12}></Grid>
        </>
      )}
      <Grid size={12}>Criticals</Grid>
      {attack.results.criticals &&
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
            <Grid size={2} key={index}>
              <Button variant="outlined">Critical roll</Button>
            </Grid>
            <Grid size={12} key={index}></Grid>
          </>
        ))}
      <Grid size={12}>TODO</Grid>
    </Grid>
  );
};

export default ResolveAttackFormRoll;
