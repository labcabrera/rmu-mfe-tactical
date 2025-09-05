/* eslint-disable react/prop-types */
import React from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import SelectCover from '../../../shared/selects/SelectCover';

const ResolveAttackFormModifiers = ({ formData, setFormData, character, attack, index }) => {
  const customBonus = formData.attacks?.[index]?.customBonus || '';
  const cover = formData.attacks?.[index]?.cover || '';

  const handleChangeEvent = (e) => handleChange(e.target.name, e.target.value);
  const handleCoverChange = (value) => handleChange('cover', value);

  const handleChange = (name, value) => {
    console.log('Changing', name, value);
    const newAttacks = formData.attacks.map((a, i) => (i === index ? { ...a, [name]: value } : a));
    setFormData({ ...formData, attacks: newAttacks });
  };

  return (
    <Grid container spacing={2} sx={{ marginTop: 1, marginBottom: 1 }}>
      <Grid size={2}>
        <SelectCover value={cover} onChange={handleCoverChange} />
      </Grid>
      <Grid size={2}>
        <TextField label="custom-bonus" value={customBonus} name="customBonus" onChange={handleChangeEvent} fullWidth variant="standard" />
      </Grid>
    </Grid>
  );
};

export default ResolveAttackFormModifiers;
