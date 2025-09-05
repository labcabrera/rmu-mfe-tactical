/* eslint-disable react/prop-types */
import React from 'react';
import TextField from '@mui/material/TextField';

const ResolveAttackFormModifiers = ({ formData, setFormData, character, attack, index }) => {
  // Get the current value of foo for this attack
  const fooValue = formData.attacks?.[index]?.foo || '';

  // Handler to update foo for the correct attack
  const handleFooChange = (e) => {
    console.log('Foo changed:', e.target.value, index);
    const newValue = e.target.value;
    const newAttacks = formData.attacks.map((a, i) => (i === index ? { ...a, foo: newValue } : a));
    console.log('New attacks array:', newAttacks);
    setFormData({ ...formData, attacks: newAttacks });
  };

  return <TextField label="Foo" value={fooValue} onChange={handleFooChange} fullWidth size="small" variant="outlined" />;
};

export default ResolveAttackFormModifiers;
