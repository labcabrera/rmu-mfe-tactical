/* eslint-disable react/prop-types */
import React from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import SelectCover from '../../../shared/selects/SelectCover';
import SelectDodge from '../../../shared/selects/SelectDodge';
import SelectPositionalSource from '../../../shared/selects/SelectPositionalSource';
import SelectPositionalTarget from '../../../shared/selects/SelectPositionalTarget';
import SelectRestrictedQuarters from '../../../shared/selects/SelectRestrictedQuarters';

const ResolveAttackFormModifiers = ({ formData, setFormData, character, attack, index }) => {
  const customBonus = formData.attacks?.[index]?.customBonus || '';
  const cover = formData.attacks?.[index]?.cover || '';
  const restrictedQuarters = formData.attacks?.[index]?.restrictedQuarters || '';
  const positionalSource = formData.attacks?.[index]?.positionalSource || '';
  const positionalTarget = formData.attacks?.[index]?.positionalTarget || '';
  const dodge = formData.attacks?.[index]?.dodge || '';
  const range = formData.attacks?.[index]?.range || '';
  const disabledDB = formData.attacks?.[index]?.disabledDB || '';
  const disabledShield = formData.attacks?.[index]?.disabledShield || '';
  const disabledParry = formData.attacks?.[index]?.disabledParry || '';

  const handleChangeEvent = (e) => handleChange(e.target.name, e.target.value);
  const handleSwitchChangeEvent = (e) => handleChange(e.target.name, e.target.checked);

  const handleChange = (name, value) => {
    console.log('Changing', name, value);
    const newAttacks = formData.attacks.map((a, i) => (i === index ? { ...a, [name]: value } : a));
    setFormData({ ...formData, attacks: newAttacks });
  };

  return (
    <Grid container spacing={2} sx={{ marginTop: 1, marginBottom: 1 }}>
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
        <FormControlLabel control={<Switch value={disabledDB} name="disabledDB" onChange={handleSwitchChangeEvent} />} label="Disabled DB" />
        <FormControlLabel
          control={<Switch value={disabledShield} name="disabledShield" onChange={handleSwitchChangeEvent} />}
          label="Disabled Shield"
        />
        <FormControlLabel control={<Switch value={disabledParry} name="disabledParry" onChange={handleSwitchChangeEvent} />} label="Disabled Parry" />
        <FormControlLabel control={<Switch value={disabledParry} name="disabledParry" onChange={handleSwitchChangeEvent} />} label="Disabled Parry" />
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={2}>
        <TextField label="custom-bonus" value={customBonus} name="customBonus" onChange={handleChangeEvent} fullWidth variant="standard" />
      </Grid>
      <Grid size={2}>
        <TextField label="range" value={range} name="range" onChange={handleChangeEvent} fullWidth variant="standard" />
      </Grid>
    </Grid>
  );
};

export default ResolveAttackFormModifiers;
