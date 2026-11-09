import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Stack, Typography } from '@mui/material';
import {
  formatBonus,
  RollBreakdown,
  RollModifier,
  RollResultAlert,
  RuleHint,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { MedicalResultDto } from '../../api/actor-rounds.dto';
import { MedicalResponse, MedicalTarget } from './medical-roll-rules';

const RESULT_SEVERITY: Record<MedicalResultDto['result'], 'error' | 'warning' | 'info' | 'success'> = {
  'absolute-failure': 'error',
  failure: 'warning',
  'partial-success': 'info',
  success: 'success',
  'absolute-success': 'success',
};

/** The result of the roll: its total and breakdown, and what it did to the injury or the dying effect. */
const MedicalResultView: FC<{ result: MedicalResponse; target: MedicalTarget }> = ({ result, target }) => {
  const { t } = useTranslation();
  const after =
    target.kind === 'treat' ? result.actorRound.injuries?.find((injury) => injury.id === target.injury.id) : undefined;
  const bleedingBefore = target.kind === 'treat' ? Math.max(0, target.injury.bleeding ?? 0) : 0;
  const bleedingAfter = Math.max(0, after?.bleeding ?? 0);
  // Spec 052: the API's breakdown, or the same entries from the numbers of an older API
  const breakdown: RollModifier[] = (
    result.breakdown ?? [
      { key: 'medicine', value: result.bonus, group: 'skill' },
      { key: 'difficulty', value: result.difficulty, group: 'situation' },
      { key: 'healer-penalty', value: result.healerPenalty, group: 'penalty' },
    ]
  ).filter((modifier) => modifier.key !== 'roll' && (modifier.key !== 'healer-penalty' || modifier.value !== 0));

  return (
    <Stack spacing={1.5}>
      <RollResultAlert
        severity={RESULT_SEVERITY[result.result]}
        headline={`${t(result.result)} · ${t('total')} ${result.total}`}
        lines={[result.message]}
      />
      <RuleHint
        title={t(result.result)}
        description={t(`medical-result-${result.result}-explanation`)}
        reference={target.kind === 'treat' || target.kind === 'amputate' ? '§13.1' : '§13.2'}
      >
        <Typography variant="body2" color="text.secondary">
          {t('medical-result-why')}
        </Typography>
      </RuleHint>
      <RollBreakdown context="medical" modifiers={breakdown} roll={result.roll} total={result.total} />
      {target.kind === 'treat' && (
        <Stack spacing={0.5}>
          {bleedingBefore > 0 && (
            <Typography variant="body2">
              {t('medical-bleeding-change', { before: bleedingBefore, after: bleedingAfter })}
            </Typography>
          )}
          {after && after.penalty !== target.injury.penalty && (
            <Typography variant="body2" color="error.main">
              {t('medical-penalty-change', { before: target.injury.penalty, after: after.penalty })}
            </Typography>
          )}
          {result.recoveryModifier !== 0 && (
            <Typography variant="body2" color="text.secondary">
              {t('medical-recovery-modifier', { value: formatBonus(result.recoveryModifier) })}
            </Typography>
          )}
        </Stack>
      )}
      {result.heat ? (
        <Alert severity="warning">
          <Typography variant="body2">
            {t('cauterize-heat-result', { severity: result.heat.critical, hits: result.heat.hits })}
          </Typography>
          {result.heat.criticalRoll !== undefined ? (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {t('cauterize-heat-critical-resolved', {
                roll: result.heat.criticalRoll,
                hits: result.heat.criticalDamage ?? 0,
              })}
              {result.heat.criticalText ? ` ${result.heat.criticalText}` : ''}
            </Typography>
          ) : (
            result.heat.alertId && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {t('cauterize-heat-critical-alert')}
              </Typography>
            )
          )}
        </Alert>
      ) : (
        result.heatCritical && (
          <Alert severity="warning">{t('cauterize-heat-critical', { severity: result.heatCritical })}</Alert>
        )
      )}
      {result.unusualEvent && <Alert severity="error">{t('cauterize-unusual-event')}</Alert>}
      {target.kind === 'amputate' && result.lostLimb && (
        <Stack spacing={1}>
          <Typography variant="body2">{t('amputation-stump', { count: result.injuryIds?.length ?? 0 })}</Typography>
          {result.criticalAlertId && <Alert severity="error">{t('amputation-critical-alert')}</Alert>}
          {result.dyingRounds && (
            <Alert severity="error">{t('amputation-system-shock-dying', { count: result.dyingRounds })}</Alert>
          )}
        </Stack>
      )}
      {target.kind === 'revive' && (
        <Stack spacing={1}>
          <Alert severity={result.revived ? 'success' : 'warning'}>
            {t(result.revived ? 'revive-success' : 'revive-failed')}
          </Alert>
          {result.shock && (
            <Alert severity="error">
              {t('revive-shock', { severity: result.shock.criticalSeverity, hits: result.shock.hits })}
            </Alert>
          )}
        </Stack>
      )}
      {target.kind === 'stabilize' && (
        <Typography variant="body2">
          {result.roundsGained
            ? t('stabilize-rounds-gained', { count: result.roundsGained })
            : t('stabilize-no-rounds-gained')}
        </Typography>
      )}
    </Stack>
  );
};

export default MedicalResultView;
