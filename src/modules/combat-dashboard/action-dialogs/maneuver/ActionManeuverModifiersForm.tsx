import React, { Dispatch, FC, SetStateAction, useContext } from 'react';
import { Button, Grid } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { resolveManeuver } from '../../../api/action';
import { Action, ActionManeuver } from '../../../api/action.dto';
import { NumericInput } from '../../../shared/inputs/NumericInput';
import SelectDifficulty from '../../../shared/selects/SelectDifficulty';
import SelectLightModifier from '../../../shared/selects/SelectLightModifier';
import SelectLightType from '../../../shared/selects/SelectLightType';

const ActionManeuverModifiersForm: FC<{
  action: Action;
  formData: ActionManeuver;
  setFormData: Dispatch<SetStateAction<ActionManeuver>>;
}> = ({ action, formData, setFormData }) => {
  const { updateAction } = useContext(CombatContext)!;
  const { showError } = useError();

  const readOnly = action.status === 'completed';

  type ModifierKey = keyof ActionManeuver['modifiers'];

  function setModifier<K extends ModifierKey>(key: K, value: ActionManeuver['modifiers'][K]) {
    setFormData((prev) => ({
      ...prev,
      modifiers: { ...(prev.modifiers as ActionManeuver['modifiers']), [key]: value },
    }));
  }

  function updateRoll(e: number): void {
    setFormData((prev) => ({ ...prev, roll: { ...(prev.roll || {}), roll: e } }));
  }

  function onResolve(): void {
    resolveManeuver(action.id, formData)
      .then((result: Action) => {
        updateAction(result);
      })
      .catch((err: Error) => showError(err.message));
  }

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <SelectDifficulty
          value={formData.modifiers.difficulty}
          onChange={(value) => setModifier('difficulty', value)}
          readOnly={readOnly}
        />
      </Grid>
      <Grid size={12}>
        <SelectLightModifier
          value={formData.modifiers.lightModifier}
          onChange={(value) => setModifier('lightModifier', value)}
          readOnly={readOnly}
        />
      </Grid>
      {formData.modifiers?.lightModifier !== 'none' && (
        <Grid size={12}>
          <SelectLightType
            value={formData.modifiers.light}
            lightModifier={formData.modifiers.lightModifier}
            onChange={(value) => setModifier('light', value)}
            readOnly={readOnly}
          />
        </Grid>
      )}
      {action.status !== 'completed' && (
        <>
          <Grid size={2}>
            <NumericInput label={t('maneuver-roll')} value={formData.roll?.roll || 0} onChange={(e) => updateRoll(e)} />
          </Grid>
          <Grid size={12}>
            <Button variant="contained" color="success" size="large" onClick={onResolve}>
              Resolve
            </Button>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default ActionManeuverModifiersForm;
