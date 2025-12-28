import React, { FC, useContext, useEffect, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { Action, ActionManeuver } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import type { Character } from '../../../api/characters';
import { NumericInput } from '../../../shared/inputs/NumericInput';
import ActionManeuverModifiersForm from './ActionManeuverModifiersForm';

const ActionManeuverForm: FC<{
  action: Action;
  actorRound: ActorRound;
  character: Character;
}> = ({ action, actorRound, character }) => {
  const { refreshActorRounds, updateAction } = useContext(CombatContext);
  const { showError } = useError();
  const [isValidDeclaration, setIsValidDeclaration] = useState(false);
  const [formData, setFormData] = useState<ActionManeuver>(null);

  function updateRoll(e: number): void {
    setFormData((prev) => {
      const updated = {
        ...prev,
        roll: {
          ...prev.roll,
          roll: e,
        },
      };
    });
  }

  useEffect(() => {
    if (action.maneuver) {
      setFormData(action.maneuver);
    } else {
      setFormData({
        modifiers: {
          maneuverType: '',
          skillId: '',
          difficulty: '',
          customModifier: null,
        },
        roll: {
          roll: null,
        },
      });
    }
  }, [action]);

  if (!formData) return <div>Loading...</div>;

  return (
    <>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={12}>
          <Typography variant="h6" gutterBottom>
            {action.maneuver?.modifiers?.maneuverType}
          </Typography>
          <Typography variant="h6" gutterBottom>
            {action.maneuver?.modifiers?.skillId}
          </Typography>
        </Grid>
        <Grid size={12}>
          <ActionManeuverModifiersForm formData={formData} setFormData={setFormData} />
        </Grid>
        <Grid size={2}>
          <NumericInput
            label={t('maneuver-roll')}
            value={action.maneuver?.roll?.roll || 0}
            onChange={(e) => updateRoll(e)}
          />
        </Grid>
      </Grid>
      <pre>formData: {JSON.stringify(formData, null, 2)}</pre>
      <pre>action: {JSON.stringify(action, null, 2)}</pre>
    </>
  );
};

export default ActionManeuverForm;
