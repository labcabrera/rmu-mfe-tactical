import React, { Dispatch, FC, Fragment, SetStateAction } from 'react';
import { Grid } from '@mui/material';
import { AttackDeclaration } from '../../../api/action.dto';
import ResolveAttackFormModifiers from './ResolveAttackFormModifiers';

const ResolveAttackDeclaration: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
}> = ({ formData, setFormData }) => {
  return (
    <Grid container spacing={1}>
      {formData.attacks.map((attack, index) => (
        <Fragment key={index}>
          <Grid size={12}>
            <ResolveAttackFormModifiers formData={formData} setFormData={setFormData} index={index} />
          </Grid>
        </Fragment>
      ))}
    </Grid>
  );
};

export default ResolveAttackDeclaration;
