import React, { FC } from 'react';
import { Chip, Grid, Stack, Typography } from '@mui/material';
import { Action } from '../../../api/action.dto';
import KeyValueModifiersView from '../../../shared/generic/KeyValueModifiersView';

const MovementResult: FC<{
  action: Action;
}> = ({ action }) => {
  return (
    <>
      <Grid size={12}>
        <Typography variant="h6">Result</Typography>
        <Stack direction="row" spacing={1} mt={1}>
          <Chip
            label={`Percent: ${action.movement.calculated.percent}%`}
            color={action.movement.calculated.percent < 100 ? 'error' : 'success'}
          />
        </Stack>
        <Stack direction="row" spacing={1} mt={1}>
          <Chip label={`Action points: ${action.actionPoints}`} />
        </Stack>
        <Stack direction="row" spacing={1} mt={1}>
          <Chip label={`BMR: ${action.movement.calculated.bmr}'`} />
          <Chip label={`Pace x${action.movement.calculated.paceMultiplier}`} />
          <Chip label={`Distance: ${action.movement.calculated.distance}'`} />
          <Chip label={`Adjusted: ${action.movement.calculated.distanceAdjusted}`} />
        </Stack>
        <Stack direction="row" spacing={1} mt={1}>
          <Chip label={`Fatigue: ${action.fatigue || '0'}`} />
        </Stack>
      </Grid>

      {action.movement.roll && action.movement.roll.modifiers && (
        <>
          <Grid size={12}>
            <Typography variant="h6">Modifiers</Typography>
            <Stack direction="row" spacing={1} mt={1} mb={1}>
              <Chip label={`Total: ${action.movement.roll.totalRoll}`} />
            </Stack>
            <KeyValueModifiersView modifiers={action.movement.roll.modifiers || []} />
          </Grid>
        </>
      )}
    </>
  );
};

export default MovementResult;
