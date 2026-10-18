import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Paper, Stack, Typography } from '@mui/material';
import { EffectList } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActionAttack, AttackStatus } from '../../../api/action.dto';

const SEVERITY: Record<AttackStatus, 'info' | 'warning' | 'success'> = {
  pending_attack_roll: 'info',
  pending_critical_roll: 'warning',
  pending_fumble_roll: 'warning',
  pending_apply: 'success',
  completed: 'success',
};

/** What the attack is waiting for, from its status: the next roll to enter, or that it is ready to apply. */
export const AttackNextStep: FC<{ attack: ActionAttack }> = ({ attack }) => {
  const { t } = useTranslation();
  if (!attack.status) return null;
  return (
    <Alert severity={SEVERITY[attack.status]} variant="outlined" sx={{ py: 0 }}>
      {t(`attack-next-step-${attack.status}`)}
    </Alert>
  );
};

/**
 * What the attack will do to its target once applied: the damage of the hit, its criticals and the fumble's, and
 * the effects, most severe first.
 */
export const AttackResultSummary: FC<{ attack: ActionAttack; targetName?: string }> = ({ attack, targetName }) => {
  const { t } = useTranslation();
  const results = attack.results;
  if (!results || (attack.status !== 'pending_apply' && attack.status !== 'completed')) return null;

  const criticals = results.criticals ?? [];
  const damage = (results.attackTableEntry?.damage ?? 0) + criticals.reduce((sum, critical) => sum + (critical.result?.damage ?? 0), 0);
  const effects = criticals.flatMap((critical) => critical.result?.effects ?? []);
  const fumble = results.fumble;

  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Stack spacing={1}>
        <Typography variant="subtitle2">
          {fumble ? t('fumble-result-title') : t('attack-result-title', { target: targetName ?? t('target') })}
        </Typography>
        {!fumble && (
          <Typography variant="h6" color={damage > 0 ? 'error.main' : 'text.secondary'}>
            {damage > 0 ? t('damage-points', { count: damage }) : t('no-damage')}
          </Typography>
        )}
        <EffectList effects={fumble ? (fumble.effects ?? []) : effects} size="medium" />
      </Stack>
    </Paper>
  );
};
