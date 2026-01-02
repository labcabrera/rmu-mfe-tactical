import React, { Dispatch, FC, SetStateAction } from 'react';
import { Grid } from '@mui/material';
import { Action, AttackDeclaration } from '../../../api/action.dto';
import ResolveAttackInfo from '../attack/ResolveAttackInfo';
import ResolveAttackFormParry from './ResolveAttackFormParry';

const ResolveAttackParry: FC<{
  action: Action;
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
}> = ({ action, formData, setFormData }) => {
  if (!formData || !formData.attacks) return <div>Loading...</div>;

  return (
    <Grid container spacing={1}>
      {formData.attacks.map((attack, index) => (
        <Grid size={12} key={index}>
          <ResolveAttackInfo action={action} attack={attack} />
        </Grid>
      ))}
      <Grid size={12}>
        <ResolveAttackFormParry formData={formData} setFormData={setFormData} />
      </Grid>
    </Grid>
  );
};

export default ResolveAttackParry;
