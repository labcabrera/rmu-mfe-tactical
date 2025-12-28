import React, { Dispatch, FC, SetStateAction } from 'react';
import { Button, Grid } from '@mui/material';
import { t } from 'i18next';
import { ActionManeuver } from '../../../api/action.dto';
import { NumericInput } from '../../../shared/inputs/NumericInput';
import SelectDifficulty from '../../../shared/selects/SelectDifficulty';
import SelectLightModifier from '../../../shared/selects/SelectLightModifier';
import SelectLightType from '../../../shared/selects/SelectLightType';

const ActionManeuverModifiersForm: FC<{
  formData: ActionManeuver;
  setFormData: Dispatch<SetStateAction<ActionManeuver>>;
}> = ({ formData, setFormData }) => {
  function updateRoll(e: number): void {
    setFormData({ ...formData, roll: { ...formData.roll, roll: e } });
  }

  return (
    <Grid container spacing={2}>
      <Grid size={12}>Maneuver modifiers todo</Grid>
      <Grid size={12}>
        <SelectDifficulty
          value={formData.modifiers.difficulty}
          onChange={(value) => setFormData({ ...formData, modifiers: { ...formData.modifiers, difficulty: value } })}
        />
      </Grid>
      <Grid size={12}>
        <SelectLightModifier
          value={formData.modifiers.lightModifier}
          onChange={(value) => setFormData({ ...formData, modifiers: { ...formData.modifiers, lightModifier: value } })}
        />
      </Grid>
      {formData.modifiers?.lightModifier !== 'none' && (
        <Grid size={12}>
          <SelectLightType
            value={formData.modifiers.light}
            lightModifier={formData.modifiers.lightModifier}
            onChange={(value) => setFormData({ ...formData, modifiers: { ...formData.modifiers, light: value } })}
          />
        </Grid>
      )}
      <Grid size={2}>
        <NumericInput label={t('maneuver-roll')} value={formData.roll?.roll || 0} onChange={(e) => updateRoll(e)} />
      </Grid>
      <Grid size={12}>
        <Button variant="contained" color="primary">
          Resolve
        </Button>
      </Grid>
    </Grid>
  );
};

export default ActionManeuverModifiersForm;
