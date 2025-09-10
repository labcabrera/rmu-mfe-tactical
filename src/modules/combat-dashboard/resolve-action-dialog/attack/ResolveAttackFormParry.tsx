import React, { ChangeEvent, FC, useContext } from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { AttackDeclarationDto } from '../../../api/actions';
import { NumericInput } from '../../../shared/inputs/NumericInput';
import NumericReadonlyInput from '../../../shared/inputs/NumericReadonlyInput';
import SelectCover from '../../../shared/selects/SelectCover';
import SelectDodge from '../../../shared/selects/SelectDodge';
import SelectPositionalSource from '../../../shared/selects/SelectPositionalSource';
import SelectPositionalTarget from '../../../shared/selects/SelectPositionalTarget';
import SelectRestrictedQuarters from '../../../shared/selects/SelectRestrictedQuarters';

const ResolveAttackFormModifiers: FC<{
  formData: AttackDeclarationDto;
  setFormData: (data: AttackDeclarationDto) => void;
  index: number;
}> = ({ formData, setFormData, index }) => {
  const { characters } = useContext(CombatContext);

  const bo = formData.attacks?.[index]?.bo || '';
  const customBonus = formData.attacks?.[index]?.customBonus || null;
  const cover = formData.attacks?.[index]?.cover || '';
  const restrictedQuarters = formData.attacks?.[index]?.restrictedQuarters || '';
  const positionalSource = formData.attacks?.[index]?.positionalSource || '';
  const positionalTarget = formData.attacks?.[index]?.positionalTarget || '';
  const dodge = formData.attacks?.[index]?.dodge || '';
  const range = formData.attacks?.[index]?.range || null;
  const disabledDB = formData.attacks?.[index]?.disabledDB || false;
  const disabledShield = formData.attacks?.[index]?.disabledShield || false;
  const disabledParry = formData.attacks?.[index]?.disabledParry || false;
  const targetName = characters.find((c) => c.id === formData.attacks?.[index]?.targetId)?.name || '';

  const handleChangeEvent = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleChange(e.target.name, e.target.value);

  const handleSwitchChangeEvent = (e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.name, e.target.checked);

  const handleChange = (name: string, value: string | boolean) => {
    const newAttacks = formData.attacks.map((a, i) => (i === index ? { ...a, [name]: value } : a));
    setFormData({ ...formData, attacks: newAttacks });
  };

  const onCustomBonusChange = (value: number | null) => {
    const newAttacks = formData.attacks.map((a, i) => (i === index ? { ...a, customBonus: value } : a));
    setFormData({ ...formData, attacks: newAttacks });
  };

  const onRangeChange = (value: number | null) => {
    const newAttacks = formData.attacks.map((a, i) => (i === index ? { ...a, range: value } : a));
    setFormData({ ...formData, attacks: newAttacks });
  };

  return (
    <Grid container spacing={2} sx={{ marginTop: 1, marginBottom: 1 }}>
      <Grid size={2}>
        <TextField label={t('target')} value={targetName} name="target" fullWidth variant="standard" />
      </Grid>
      <Grid size={2}>
        <NumericReadonlyInput label={t('attack-used-bo')} value={bo} name="target" />
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
        <FormControlLabel control={<Switch checked={!!disabledDB} name="disabledDB" onChange={handleSwitchChangeEvent} />} label="Disabled DB" />
        <FormControlLabel
          control={<Switch checked={!!disabledShield} name="disabledShield" onChange={handleSwitchChangeEvent} />}
          label="Disabled Shield"
        />
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
