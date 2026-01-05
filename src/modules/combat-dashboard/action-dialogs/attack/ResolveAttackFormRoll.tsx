import React, { Dispatch, FC, SetStateAction, useContext, useState } from 'react';
import { Grid, Chip, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { updateAttackRoll } from '../../../api/action';
import { Action, ActionAttack, AttackDeclaration } from '../../../api/action.dto';
import Effect from '../../../shared/generic/Effect';
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
  const { updateAction } = useContext(CombatContext);
  const { showError } = useError();
  const [attackRoll, setAttackRoll] = useState<number | undefined>(attack.roll?.roll);
  const [locationRoll, setLocationRoll] = useState<number | undefined>(attack.roll?.locationRoll);

  if (!formData || !formData.attacks || formData.attacks.length <= index) return <div>Loading...</div>;

  const onRollChange = (value: number | undefined) => {
    setAttackRoll(value);
    handleRollChange(value, locationRoll);
  };

  const onLocationRollChange = (value: number | undefined) => {
    setLocationRoll(value);
    handleRollChange(attackRoll, value);
  };

  const handleRollChange = (newAttackRoll?: number | undefined, newLocationRoll?: number | undefined) => {
    const roll = newAttackRoll !== undefined ? newAttackRoll : attackRoll;
    const loc = newLocationRoll !== undefined ? newLocationRoll : locationRoll;
    if (roll === undefined || roll === null) return;
    if (attack.calculated.requiredLocationRoll && (loc === undefined || loc === null)) return;
    updateAttackRoll(action.id, attack.attackName, roll, loc)
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

  const getCriticalText = (): string => {
    if (!attack.results || !attack.results.criticals || attack.results.criticals.length === 0) return '';
    return `Critical ${attack.results.attackTableEntry.criticalSeverity}${attack.results.attackTableEntry.criticalType}`;
  };

  return (
    <Grid container spacing={1}>
      <Grid size={12}>
        <ResolveAttackInfo action={action} attack={formData.attacks[index]} />
      </Grid>
      {attack.calculated.requiredLocationRoll && (
        <Grid size={2} offset={2}>
          <NumericInput
            label={t('location-roll')}
            value={attack.roll?.locationRoll || null}
            min={1}
            max={100}
            onChange={(e) => onLocationRollChange(e)}
            disabled={action.status === 'completed'}
            error={!locationRoll}
          />
        </Grid>
      )}
      <Grid size={2}>
        {attack.calculated.location && (
          <Grid size={8}>
            <Chip size="medium" color="error" label={t(attack.calculated.location)} />
          </Grid>
        )}
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={2} offset={2}>
        <NumericInput
          label={t('attack-roll')}
          value={attack.roll?.roll || null}
          onChange={(e) => onRollChange(e)}
          disabled={action.status === 'completed'}
          error={!attackRoll}
        />
      </Grid>

      {attack.results && attack.results.attackTableEntry && (
        <Grid size={8}>
          <Stack direction="row" spacing={1}>
            {attack.results.attackTableEntry.damage > 0 ? (
              <Effect effect={'dmg'} value={attack.results.attackTableEntry.damage} color="error" />
            ) : (
              <Typography>{t('no-damage')}</Typography>
            )}
            {attack.results.attackTableEntry.criticalType && <Chip label={getCriticalText()} color="error" />}
          </Stack>
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
