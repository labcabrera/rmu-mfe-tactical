import React, { FC } from 'react';
import { Grid, Stack, Typography } from '@mui/material';
import { CategorySeparator } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { Action } from '../../../api/action.dto';
import { gridSizeCard } from '../../../services/display';
import ModifierDualList from '../../../shared/ModifierDualList';

const MovementResult: FC<{
  action: Action;
}> = ({ action }) => {
  if (!action || !action.movement || !action.movement.calculated) return;

  const percent = action.movement.calculated.percent;
  const modifiers = action.movement.modifiers;
  const calculated = action.movement.calculated;

  return (
    <>
      <CategorySeparator text="Results" />
      <Grid container spacing={1}>
        {calculated.critical && (
          <KeyValueInfo value={`${calculated.critical}K`} label={t('Received critical')} valueColor="error" />
        )}
        <KeyValueInfo value={`${percent}%`} label={t('Percent')} valueColor={percent < 100 ? 'error' : undefined} />
        <KeyValueInfo value={`${calculated.distance}'`} label={t('Distance')} />
        <KeyValueInfo value={calculated.distanceAdjusted} label={t('Adjusted distance')} />
        <KeyValueInfo value={action.actionPoints} label={t('Action points')} />
        <KeyValueInfo value={action.fatigue || 0} label={t('Fatigue')} />
        <KeyValueInfo value={t(modifiers.pace)} label={t('Pace')} />
        <KeyValueInfo value={t(modifiers.skillId!)} label={t('Skill')} />
        {modifiers.difficulty && (
          <KeyValueInfo value={t(`difficulty-${modifiers.difficulty}`)} label={t('Difficulty')} />
        )}
        {action.movement.roll && action.movement.roll.modifiers && (
          <Grid size={12}>
            <CategorySeparator text="Roll modifiers" />
            <ModifierDualList modifiers={action.movement.roll.modifiers} />
          </Grid>
        )}
      </Grid>
    </>
  );
};

const KeyValueInfo: FC<{
  value: string | number | null;
  label: string;
  valueColor?: string;
}> = ({ value, label, valueColor }) => {
  return (
    <Grid size={gridSizeCard}>
      <Stack>
        <Typography variant="h6" color={valueColor || 'primary'}>
          {value}
        </Typography>
        <Typography variant="caption" color="secondary">
          {label}
        </Typography>
      </Stack>
    </Grid>
  );
};

export default MovementResult;
