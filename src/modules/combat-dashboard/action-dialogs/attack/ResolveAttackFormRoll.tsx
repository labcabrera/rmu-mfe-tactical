import React, { Dispatch, FC, SetStateAction, useContext, useState } from 'react';
import { Grid, Chip } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { updateAttackRoll } from '../../../api/action';
import { Action, ActionAttack, AttackDeclaration } from '../../../api/action.dto';
import { NumericInput } from '../../../shared/inputs/NumericInput';
import ResolveAttackFormCriticals from './ResolveAttackFormCriticals';
import ResolveAttackFormFumble from './ResolveAttackFormFumble';
import ResolveAttackInfo from './ResolveAttackInfo';

const ResolveAttackFormRoll: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  action: Action;
  attack: ActionAttack;
  index: number;
}> = ({ formData, setFormData, action, attack, index }) => {
  const { actorRounds, updateAction } = useContext(CombatContext);
  const { showError } = useError();
  const target = actorRounds.find((a) => a.actorId === attack.modifiers?.targetId);
  const requiredLocation = !target.defense.at && attack.modifiers.calledShot && attack.modifiers.calledShot === 'none';
  const [attackRoll, setAttackRoll] = useState<number | undefined>(attack.roll?.roll);
  const [locationRoll, setLocationRoll] = useState<number | undefined>(attack.roll?.locationRoll);

  if (!formData || !formData.attacks || formData.attacks.length <= index) return <div>Loading...</div>;

  const onRollChange = (value: number | undefined) => {
    setAttackRoll(value);
    handleRollChange();
  };

  const onLocationRollChange = (value: number | undefined) => {
    setLocationRoll(value);
    handleRollChange();
  };

  const handleRollChange = () => {
    if (!attackRoll) return;
    if (requiredLocation && !locationRoll) return;
    console.log('Updating attack roll:', attackRoll, locationRoll);
    updateAttackRoll(action.id, attack.attackName, attackRoll, locationRoll)
      .then((updatedAction) => {
        const newFormData = { attacks: updatedAction.attacks, parries: updatedAction.parries } as AttackDeclaration;
        updateAction(updatedAction);
        setFormData(newFormData);
      })
      .catch((err: Error) => showError(err.message));
  };

  const isCriticalAttack = (): boolean => {
    return attack.results?.criticals !== undefined && attack.results.criticals.length > 0;
  };

  const isFumbleAttack = (): boolean => {
    return attack.results && attack.results.fumble;
  };

  return (
    <Grid container spacing={1}>
      <Grid size={12}>
        <ResolveAttackInfo action={action} attack={formData.attacks[index]} />
      </Grid>
      <Grid size={2}></Grid>
      <Grid size={2}>
        <NumericInput
          label={t('attack-roll')}
          value={attack.roll?.roll || null}
          onChange={(e) => onRollChange(e)}
          disabled={action.status === 'completed'}
          error={!attackRoll}
        />
      </Grid>
      <Grid size={2}>
        {requiredLocation && (
          <NumericInput
            label={t('location-roll')}
            value={attack.roll?.locationRoll || null}
            min={1}
            max={100}
            onChange={(e) => onLocationRollChange(e)}
            disabled={action.status === 'completed'}
            error={!locationRoll}
          />
        )}
      </Grid>
      {attack.results && attack.results.attackTableEntry && (
        <Grid size={1}>
          <Chip size="medium" color="info" label={attack.results.attackTableEntry.text} />
        </Grid>
      )}
      <Grid size={12}></Grid>
      {isCriticalAttack() && (
        <ResolveAttackFormCriticals
          attack={attack}
          formData={formData}
          setFormData={setFormData}
          action={action}
          index={index}
        />
      )}
      {isFumbleAttack() && (
        <ResolveAttackFormFumble
          attack={attack}
          formData={formData}
          setFormData={setFormData}
          action={action}
          index={index}
        />
      )}
      <Grid size={12}></Grid>
    </Grid>
  );
};

export default ResolveAttackFormRoll;
