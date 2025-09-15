import React, { ChangeEvent, Dispatch, FC, SetStateAction, useContext } from 'react';
import { FormControlLabel, Grid, Switch, TextField } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { ActionAttack } from '../../../api/action';
import { NumericInput } from '../../../shared/inputs/NumericInput';
import NumericReadonlyInput from '../../../shared/inputs/NumericReadonlyInput';
import SelectCalledShot from '../../../shared/selects/SelectCalledShot';
import SelectCover from '../../../shared/selects/SelectCover';
import SelectDodge from '../../../shared/selects/SelectDodge';
import SelectPositionalSource from '../../../shared/selects/SelectPositionalSource';
import SelectPositionalTarget from '../../../shared/selects/SelectPositionalTarget';
import SelectRestrictedQuarters from '../../../shared/selects/SelectRestrictedQuarters';
import ActorRoundArmor from './ActorRoundArmor';

const ResolveAttackFormModifiers: FC<{
  formData: ActionAttack;
  setFormData: Dispatch<SetStateAction<ActionAttack>>;
  index: number;
}> = ({ formData, setFormData, index }) => {
  const { actorRounds } = useContext(CombatContext);

  const modifiers = formData.attacks?.[index]?.modifiers;
  const bo = formData.attacks?.[index]?.modifiers?.bo || null;
  const customBonus = formData.attacks?.[index]?.modifiers?.customBonus || null;
  const cover = formData.attacks?.[index]?.modifiers?.cover || '';
  const restrictedQuarters = formData.attacks?.[index]?.modifiers?.restrictedQuarters || '';
  const positionalSource = formData.attacks?.[index]?.modifiers?.positionalSource || '';
  const positionalTarget = formData.attacks?.[index]?.modifiers?.positionalTarget || '';
  const dodge = formData.attacks?.[index]?.modifiers?.dodge || '';
  const range = formData.attacks?.[index]?.modifiers?.range || null;
  const disabledDB = formData.attacks?.[index]?.modifiers?.disabledDB || false;
  const disabledShield = formData.attacks?.[index]?.modifiers?.disabledShield || false;
  const disabledParry = formData.attacks?.[index]?.modifiers?.disabledParry || false;
  const target = actorRounds.find((actorRound) => actorRound.actorId === formData.attacks?.[index]?.modifiers.targetId);

  const handleChangeEvent = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleChange(e.target.name, e.target.value);

  const handleSwitchChangeEvent = (e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.name, e.target.checked);

  const handleChange = (name: string, value: string | boolean) => {
    const newAttacks = formData.attacks.map((a, i) => (i === index ? { ...a, modifiers: { ...a.modifiers, [name]: value } } : a));
    setFormData({ ...formData, attacks: newAttacks });
  };

  const onCustomBonusChange = (value: number | null) => {
    const newAttacks = formData.attacks.map((a, i) => (i === index ? { ...a, modifiers: { ...a.modifiers, customBonus: value } } : a));
    setFormData({ ...formData, attacks: newAttacks });
  };

  const onRangeChange = (value: number | null) => {
    const newAttacks = formData.attacks.map((a, i) => (i === index ? { ...a, modifiers: { ...a.modifiers, range: value } } : a));
    setFormData({ ...formData, attacks: newAttacks });
  };

  const onCalledShotChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let penalty = 0;
    if (value !== 'none') {
      penalty = -25;
    }
    const newAttacks = formData.attacks.map((a, i) =>
      i === index ? { ...a, modifiers: { ...a.modifiers, calledShot: value, calledShotPenalty: penalty } } : a
    );
    setFormData({ ...formData, attacks: newAttacks });
  };

  const onCalledShotPenaltyChange = (value: number | null) => {
    const newAttacks = formData.attacks.map((a, i) => (i === index ? { ...a, modifiers: { ...a.modifiers, calledShotPenalty: value } } : a));
    setFormData({ ...formData, attacks: newAttacks });
  };

  return (
    <Grid container spacing={2} sx={{ marginTop: 1, marginBottom: 1 }}>
      <Grid size={2}>
        <TextField label={t('target')} value={target?.actorName || ''} name="target" fullWidth variant="standard" />
      </Grid>
      <Grid size={2}>
        <NumericReadonlyInput label={t('attack-used-bo')} value={bo} name="target" />
      </Grid>
      <Grid size={2}>
        <ActorRoundArmor actorRound={target} />
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={2}>
        <SelectCover value={cover} onChange={handleChangeEvent} />
      </Grid>
      <Grid size={2}>
        <SelectRestrictedQuarters value={restrictedQuarters} onChange={handleChangeEvent} />
      </Grid>
      <Grid size={2}>
        <SelectPositionalSource value={positionalSource} onChange={handleChangeEvent} />
      </Grid>
      <Grid size={2}>
        <SelectPositionalTarget value={positionalTarget} onChange={handleChangeEvent} />
      </Grid>
      <Grid size={2}>
        <SelectDodge value={dodge} onChange={handleChangeEvent} />
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={2}>
        <SelectCalledShot value={modifiers.calledShot || ''} onChange={onCalledShotChange} />
      </Grid>
      <Grid size={2}>
        {modifiers.calledShot && modifiers.calledShot !== 'none' && (
          <NumericInput
            label={t('called-shot-penalty')}
            value={modifiers.calledShotPenalty || null}
            name="calledShotPenalty"
            onChange={onCalledShotPenaltyChange}
            integer
          />
        )}
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={2}>
        <FormControlLabel control={<Switch checked={!!disabledDB} name="disabledDB" onChange={handleSwitchChangeEvent} />} label="Disabled DB" />
      </Grid>
      <Grid size={2}>
        <FormControlLabel
          control={<Switch checked={!!disabledShield} name="disabledShield" onChange={handleSwitchChangeEvent} />}
          label="Disabled Shield"
        />
      </Grid>
      <Grid size={2}>
        <FormControlLabel
          control={<Switch checked={!!disabledParry} name="disabledParry" onChange={handleSwitchChangeEvent} />}
          label="Disabled Parry"
        />
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={2}>
        <NumericInput label={t('custom-bonus')} value={customBonus} name="customBonus" onChange={onCustomBonusChange} integer />
      </Grid>
      <Grid size={2}>
        <NumericInput label={t('range')} value={range} name="range" onChange={onRangeChange} maxFractionDigits={1} allowNegatives={false} />
      </Grid>
    </Grid>
  );
};

export default ResolveAttackFormModifiers;
