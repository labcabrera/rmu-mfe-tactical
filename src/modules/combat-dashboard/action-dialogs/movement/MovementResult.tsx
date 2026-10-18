import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Stack, Typography } from '@mui/material';
import { CategorySeparator, gridSizeCard } from '@labcabrera-rmu/rmu-react-shared-lib';
import { Action } from '../../../api/action.dto';
import ModifierDualList from '../../../shared/ModifierDualList';

export default function MovementResult({ action }: { action: Action }) {
  const { t } = useTranslation();
  if (!action || !action.movement || !action.movement.calculated) return;
  const percent = action.movement.calculated.percent;
  const modifiers = action.movement.modifiers;
  const calculated = action.movement.calculated;

  return (
    <>
      <CategorySeparator text={t('results')} />
      <Grid container spacing={1}>
        {calculated.critical && (
          <KeyValueInfo value={`${calculated.critical}K`} label={t('received-critical')} valueColor="error" />
        )}
        <KeyValueInfo value={`${percent}%`} label={t('percent')} valueColor={percent < 100 ? 'error' : undefined} />
        <KeyValueInfo value={`${calculated.distance}'`} label={t('distance')} />
        <KeyValueInfo value={calculated.distanceAdjusted} label={t('adjusted-distance')} />
        <KeyValueInfo value={action.actionPoints} label={t('action-points')} />
        <KeyValueInfo value={action.fatigue || 0} label={t('fatigue')} />
        <KeyValueInfo value={t(modifiers.pace)} label={t('pace')} />
        <KeyValueInfo value={t(modifiers.skillId!)} label={t('skill')} />
        {modifiers.difficulty && (
          <KeyValueInfo value={t(`difficulty-${modifiers.difficulty}`)} label={t('difficulty')} />
        )}
        {action.movement.roll && action.movement.roll.modifiers && (
          <Grid size={12}>
            <CategorySeparator text={t('roll-modifiers')} />
            <ModifierDualList modifiers={action.movement.roll.modifiers} />
          </Grid>
        )}
      </Grid>
    </>
  );
}

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
