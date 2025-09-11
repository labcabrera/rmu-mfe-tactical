import React, { FC } from 'react';
import Grid from '@mui/material/Grid';
import { AttackDto } from '../../../api/actions';
import ResolveAttackInfo from './ResolveAttackInfo';

const ResolveAttackFormRoll: FC<{
  formData: AttackDto;
  setFormData: (data: AttackDto) => void;
  index: number;
}> = ({ formData, setFormData, index }) => {
  if (!formData || !formData.attacks || formData.attacks.length <= index) return <div>Loading...</div>;

  return (
    <Grid container spacing={2} sx={{ marginTop: 1, marginBottom: 1 }}>
      <ResolveAttackInfo attack={formData.attacks[index]} />
      <Grid size={12}>TODO</Grid>
    </Grid>
  );
};

export default ResolveAttackFormRoll;
