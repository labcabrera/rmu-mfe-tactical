import React, { Dispatch, FC, SetStateAction } from 'react';
import { Grid } from '@mui/material';
import { Action, AttackDeclaration } from '../../../api/action.dto';
import ResolveAttackFormRoll from '../attack/ResolveAttackFormRoll';

const ResolveAttackTabRoll: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  action: Action;
}> = ({ formData, setFormData, action }) => {
  return (
    <Grid container spacing={1}>
      {formData.attacks.map((attack, index) => (
        <Grid size={12} key={index}>
          <ResolveAttackFormRoll
            formData={formData}
            setFormData={setFormData}
            action={action}
            attack={attack}
            index={index}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default ResolveAttackTabRoll;
