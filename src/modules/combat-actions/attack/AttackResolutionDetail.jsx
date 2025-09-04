import React from 'react';
import { Typography } from '@mui/material';
import AttackResolutionAttributes from './AttackResolutionAttributes';

const AttackResolutionDetail = ({ attackKey, formData, setFormData, character }) => {
  return (
    <>
      <Typography>Attack {attackKey}</Typography>
      <AttackResolutionAttributes attackKey={attackKey} formData={formData} setFormData={setFormData} character={character} />
    </>
  );
};

export default AttackResolutionDetail;
