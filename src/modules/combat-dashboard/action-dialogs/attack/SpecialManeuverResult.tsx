import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Stack, Typography } from '@mui/material';
import { DisarmResult, RuleHint } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActionAttack } from '../../../api/action.dto';

const DISARM_SEVERITY: Record<DisarmResult, 'error' | 'warning' | 'info' | 'success'> = {
  'absolute-failure': 'error',
  failure: 'warning',
  partial: 'info',
  success: 'success',
  'absolute-success': 'success',
};

/**
 * Outcome of a special maneuver of workspace spec 079 (A7): the band of Table 9-7a of a disarm (a partial one goes on
 * as a normal attack with its own total; an absolute failure rolls the fumble; an unmodified 66 and the choice of an
 * absolute success are left to the game master), and the hits and critical a subdual attack changed (Table 9-7e).
 */
const SpecialManeuverResult: FC<{ attack: ActionAttack }> = ({ attack }) => {
  const { t } = useTranslation();
  const disarm = attack.disarm;
  const subdual = attack.results?.subdualAdjustment;
  if (!disarm && !subdual) return null;
  return (
    <Stack spacing={1}>
      {disarm && (
        <Alert severity={DISARM_SEVERITY[disarm.result]} variant="outlined">
          <Stack spacing={0.5}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {t(`disarm-result-${disarm.result}`, { total: disarm.total })}
            </Typography>
            <Typography variant="body2">{t(`disarm-result-${disarm.result}-help`)}</Typography>
            {disarm.result === 'partial' && disarm.attackTotal !== null && (
              <Typography variant="body2">{t('disarm-partial-attack-total', { total: disarm.attackTotal })}</Typography>
            )}
            {disarm.unusual && <Typography variant="body2">{t('disarm-unusual-help')}</Typography>}
          </Stack>
        </Alert>
      )}
      {subdual && (
        <RuleHint title={t('attack-mode-subdual')} description={t('combat-rule-subdual-damage')} reference="Table 9-7e">
          <Typography variant="body2" color="text.secondary">
            {t('subdual-adjustment', {
              base: subdual.baseDamage,
              damage: attack.results?.attackTableEntry?.damage ?? 0,
              critical: subdual.criticalType
                ? `${subdual.criticalSeverity ?? ''} ${t(`critical-type-${subdual.criticalType}`)}`.trim()
                : t('none'),
            })}
          </Typography>
        </RuleHint>
      )}
    </Stack>
  );
};

export default SpecialManeuverResult;
