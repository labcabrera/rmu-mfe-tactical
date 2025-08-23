import React from 'react';
import Stack from '@mui/material/Stack';
import ArmorButton from '../shared/buttons/ArmorButton';
import ShieldButton from '../shared/buttons/ShieldButton';
import WeaponButton from '../shared/buttons/WeaponButton';

const ForgeItemCategories = ({ onChange }) => {
  const iconSize = 60;

  const fetchWeapons = () => onChange('weapon');
  const fetchShields = () => onChange('shield');
  const fetchArmors = () => onChange('armor');

  return (
    <Stack direction="row">
      <WeaponButton onClick={fetchWeapons} size={iconSize} />
      <ShieldButton onClick={fetchShields} size={iconSize} />
      <ArmorButton onClick={fetchArmors} size={iconSize} />
    </Stack>
  );
};

export default ForgeItemCategories;
