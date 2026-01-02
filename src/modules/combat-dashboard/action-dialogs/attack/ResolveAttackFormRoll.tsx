import React, { Dispatch, FC, SetStateAction, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Grid, Chip } from '@mui/material';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { updateAttackRoll } from '../../../api/action';
import { Action, ActionAttack, AttackDeclaration } from '../../../api/action.dto';
import { NumericInput } from '../../../shared/inputs/NumericInput';
import SelectLocation from '../../../shared/selects/SelectLocation';
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
  const { t } = useTranslation();

  const target = actorRounds.find((a) => a.actorId === attack.modifiers?.targetId);
  const roll = attack.roll?.roll || undefined;
  const location = attack.roll?.location || null;

  const handleRollClick = () => {
    const attackName = attack.attackName;
    updateAttackRoll(action.id, attackName, roll, location)
      .then((updatedAction) => {
        const newFormData = { attacks: updatedAction.attacks, parries: updatedAction.parries } as AttackDeclaration;
        updateAction(updatedAction);
        setFormData(newFormData);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError('An unknown error occurred');
      });
  };

  if (!formData || !formData.attacks || formData.attacks.length <= index) return <div>Loading...</div>;

  const updateRoll = (value: number | undefined) => {
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

  const getLocation = () => {
    if (attack.modifiers.calledShot) {
      return attack.modifiers.calledShot;
    } else {
      return attack.roll?.location || null;
    }
  };

  /**
   * If the attack is a called shot, no location selection is required. Also not required if the defender uses the same armor type in all locations.
   */
  const requiresLocation = (): boolean => {
    if (attack.modifiers.calledShot !== undefined && attack.modifiers.calledShot !== 'none') return false;
    if (target.defense.at) return false;
    return true;
  };

  const isCriticalAttack = (): boolean => {
    return attack.results?.criticals !== undefined && attack.results.criticals.length > 0;
  };

  const isFumbleAttack = (): boolean => {
    return attack.results?.fumble !== null;
  };

  return (
    <Grid container spacing={1}>
      <Grid size={12}>
        <ResolveAttackInfo action={action} attack={formData.attacks[index]} />
      </Grid>
      <Grid size={2}>
        <Button
          onClick={() => handleRollClick()}
          disabled={!attack.roll?.roll}
          variant="contained"
          size="small"
          color="success"
        >
          {t('Roll attack')}
        </Button>
      </Grid>
      <Grid size={1}>
        <NumericInput label={t('attack-roll')} value={attack.roll?.roll || 0} onChange={(e) => updateRoll(e)} />
      </Grid>
      <Grid size={2}>
        {requiresLocation() && (
          <SelectLocation value={getLocation()} onChange={(e) => updateLocation(e.target.value)} />
        )}
      </Grid>
      {attack.results && attack.results.attackTableEntry && (
        <Grid size={1}>
          <Chip label={attack.results.attackTableEntry.text} />
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
