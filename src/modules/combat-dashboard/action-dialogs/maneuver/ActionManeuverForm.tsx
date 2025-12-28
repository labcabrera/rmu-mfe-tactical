import React, { FC, useContext, useEffect, useState } from 'react';
import { Chip, Grid, Stack, Typography } from '@mui/material';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { Action, ActionManeuver } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import type { Character } from '../../../api/characters';
import KeyValueModifiersView from '../../../shared/generic/KeyValueModifiersView';
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

  useEffect(() => {
    if (action.maneuver) {
      setFormData(action.maneuver);
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
          <ActionManeuverModifiersForm action={action} formData={formData} setFormData={setFormData} />
        </Grid>
        {action.status === 'completed' && (
          <Grid size={12}>
            <Typography variant="h6" gutterBottom>
              Results
            </Typography>
            <Stack direction="row" spacing={1} mt={1} mb={1}>
              <Chip label={`Total: ${action.maneuver.roll.totalRoll}`} />
            </Stack>
            <KeyValueModifiersView modifiers={action.maneuver?.roll?.modifiers} />
          </Grid>
        )}
      </Grid>
      <pre>formData: {JSON.stringify(formData, null, 2)}</pre>
      <pre>action: {JSON.stringify(action, null, 2)}</pre>
    </>
  );
};

export default ActionManeuverForm;
