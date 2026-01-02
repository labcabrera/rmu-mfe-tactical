import React, { Dispatch, FC, SetStateAction, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { Button, Grid, Chip } from '@mui/material';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { updateAttackRoll } from '../../../api/action';
import { Action, ActionAttack, AttackDeclaration } from '../../../api/action.dto';
import { NumericInput } from '../../../shared/inputs/NumericInput';
import SelectLocation from '../../../shared/selects/SelectLocation';
import ResolveAttackInfo from '../attack/ResolveAttackInfo';
import ResolveAttackFormCriticals from './ResolveAttackFormCriticals';

const ResolveAttackFormRoll: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  action: Action;
  attack: ActionAttack;
  index: number;
}> = ({ formData, setFormData, action, attack, index }) => {
  const { updateAction } = useContext(CombatContext);
  const { showError } = useError();
  const { t } = useTranslation();

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

  return (
    <Grid container spacing={1}>
      <Grid size={12}>
        <ResolveAttackInfo action={action} attack={formData.attacks[index]} />
      </Grid>
      <Grid size={2}>
        <NumericInput label={t('attack-roll')} value={attack.roll?.roll || 0} onChange={(e) => updateRoll(e)} />
      </Grid>
      <Grid size={2}>
        <SelectLocation value={getLocation()} onChange={(e) => updateLocation(e.target.value)} />
      </Grid>
      <Grid size={1}>
        <Button
          onClick={() => handleRollClick()}
          disabled={!attack.roll?.roll}
          variant="outlined"
          endIcon={<PlayCircleOutlineIcon />}
        >
          {t('roll')}
        </Button>
      </Grid>
      {attack.results && attack.results.attackTableEntry && (
        <Grid size={1}>
          <Chip label={attack.results.attackTableEntry.text} />
        </Grid>
      )}
      <Grid size={12}></Grid>
      {attack.results && attack.results.attackTableEntry && (
        <>
          <ResolveAttackFormCriticals
            attack={attack}
            formData={formData}
            setFormData={setFormData}
            action={action}
            index={index}
          />
        </>
      )}
      <Grid size={12}></Grid>
    </Grid>
  );
};

export default ResolveAttackFormRoll;
