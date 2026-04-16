import React, { FC } from 'react';
import { Grid, Stack, Typography } from '@mui/material';
import { CategorySeparator } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { Action } from '../../../api/action.dto';
import { gridSizeCard } from '../../../services/display';
import ModifierDualList from './ModifierDualList';

const MovementResult: FC<{
  action: Action;
}> = ({ action }) => {
  if (!action || !action.movement || !action.movement.calculated) return;

  const modifiers = action.movement.modifiers;
  const percent = action.movement.calculated.percent;

  return (
    <>
      <CategorySeparator text="Results" />
      <Grid container spacing={1}>
        <Grid size={gridSizeCard}>
          <Stack>
            <Typography variant="h6" color={percent < 100 ? 'error' : 'primary'}>
              {percent}%
            </Typography>
            <Typography variant="caption" color="secondary">
              {t('Percent')}
            </Typography>
          </Stack>
        </Grid>
        <Grid size={gridSizeCard}>
          <Stack>
            <Typography variant="h6" color="primary">
              {action.movement.calculated.distance}'
            </Typography>
            <Typography variant="caption" color="secondary">
              {t('Distance')}
            </Typography>
          </Stack>
        </Grid>
        <Grid size={gridSizeCard}>
          <Stack>
            <Typography variant="h6" color="primary">
              {action.movement.calculated.distanceAdjusted}
            </Typography>
            <Typography variant="caption" color="secondary">
              {t('Adjusted distance')}
            </Typography>
          </Stack>
        </Grid>
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
  value: string | number;
  label: string;
}> = ({ value, label }) => {
  return (
    <Grid size={gridSizeCard}>
      <Stack>
        <Typography variant="h6" color="primary">
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
