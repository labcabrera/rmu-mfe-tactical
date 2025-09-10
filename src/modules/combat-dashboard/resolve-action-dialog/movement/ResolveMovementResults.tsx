import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, Grid, Stack, TextField } from '@mui/material';
import type { Action } from '../../../api/actions';
import NumericReadonlyInput from '../../../shared/inputs/NumericReadonlyInput';

type ResolveMovementResultsProps = {
  action: Action;
};

const ResolveMovementResults: FC<ResolveMovementResultsProps> = ({ action }) => {
  const { t } = useTranslation();

  if (!action || !action.movement || !action.movement.calculated) {
    return <div>Unresolved movement</div>;
  }

  const getModifierColor = (value: number) => {
    if (value > 0) return 'primary';
    if (value < 0) return 'error';
    return undefined;
  };

  return (
    <Grid container spacing={2}>
      <Grid size={2}>
        <NumericReadonlyInput label={t('bmr')} name="bmr" value={action.movement.calculated.bmr} />
      </Grid>
      <Grid size={2}>
        <NumericReadonlyInput label={t('action-percent')} name="actionPercent" value={action.movement.calculated.percent} />
      </Grid>
      <Grid size={2}>
        <NumericReadonlyInput label={t('action-points')} name="actionPoints" value={action.actionPoints} />
      </Grid>
      <Grid size={2}>
        <TextField label={t('pace')} name="pace" value={t(action.movement.modifiers.pace)} variant="standard" fullWidth />
      </Grid>
      <Grid size={2}>
        <TextField
          label={t('pace-multiplier')}
          name="paceMultiplier"
          value={action.movement.calculated.paceMultiplier}
          variant="standard"
          fullWidth
        />
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={2}>
        <NumericReadonlyInput label={t('distance')} name="distance" value={action.movement.calculated.distance} />
      </Grid>
      <Grid size={2}>
        <NumericReadonlyInput label={t('distance-adjusted')} name="distanceAdjusted" value={action.movement.calculated.distanceAdjusted} />
      </Grid>
      <Grid size={12}></Grid>
      {action.movement.roll && (
        <>
          <Grid size={2}>
            <NumericReadonlyInput label={t('roll')} name="resolved-roll" value={action.movement.roll.roll} />
          </Grid>
          <Grid size={2}>
            <NumericReadonlyInput label={t('total-roll')} name="resolved-totalRoll" value={action.movement.roll.totalRoll} />
          </Grid>
          <Grid size={12}>
            <Stack direction="row" spacing={1}>
              {action.movement.roll.modifiers.map((item, index) => (
                <Stack key={index} direction="row" spacing={1} alignItems="center">
                  <Chip label={`${t(item.key)}: ${item.value}`} color={getModifierColor(item.value)} />
                </Stack>
              ))}
            </Stack>
          </Grid>
        </>
      )}
      <Grid size={2}>
        <TextField label={t('description')} name="description" value={action.movement.calculated.description} variant="standard" fullWidth />
      </Grid>
    </Grid>
  );
};

export default ResolveMovementResults;
