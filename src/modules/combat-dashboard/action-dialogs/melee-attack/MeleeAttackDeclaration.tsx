import React, { Dispatch, FC, Fragment, SetStateAction } from 'react';
import { Grid } from '@mui/material';
import { AttackDeclaration } from '../../../api/action.dto';
import MeleeAttackModifiersForm from './MeleeAttackModifiersForm';

const MeleeAttackDeclaration: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
}> = ({ formData, setFormData }) => {
  return (
    <Grid container spacing={1}>
      {formData.attacks.map((attack, index) => (
        <Fragment key={index}>
          <Grid size={12}>
            <MeleeAttackModifiersForm formData={formData} setFormData={setFormData} index={index} />
          </Grid>
        </Fragment>
      ))}
    </Grid>
  );
};

export default MeleeAttackDeclaration;
