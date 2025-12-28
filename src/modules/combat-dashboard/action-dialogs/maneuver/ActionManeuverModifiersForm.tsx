import React, { Dispatch, FC, SetStateAction } from 'react';
import { Grid } from '@mui/material';
import { ActionManeuver } from '../../../api/action.dto';
import SelectDifficulty from '../../../shared/selects/SelectDifficulty';

const ActionManeuverModifiersForm: FC<{
  formData: ActionManeuver;
  setFormData: Dispatch<SetStateAction<ActionManeuver>>;
}> = ({ formData, setFormData }) => {
  return (
    <Grid container spacing={2}>
      <Grid size={12}>Maneuver modifiers todo</Grid>
      <Grid size={12}>
        <SelectDifficulty
          value={formData.modifiers.difficulty}
          onChange={(value) => setFormData({ ...formData, modifiers: { ...formData.modifiers, difficulty: value } })}
        />
      </Grid>
    </Grid>
  );
};

export default ActionManeuverModifiersForm;
