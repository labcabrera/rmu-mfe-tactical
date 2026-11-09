import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Stack, Typography } from '@mui/material';
import { formatMultiplier, RmuChip, RuleHint, signed } from '@labcabrera-rmu/rmu-react-shared-lib';
import { AttackDamageAdjustment, AttackSeverityAdjustment } from '../../../../api/action.dto';
import { criticalCode } from '../../../../services/action-service';

/** Damage of the table, with the base and the Hit Multiplier when the attack size scaled it: `15 (10 ×1.5)`. */
export const useDamageText = () => {
  const { t, i18n } = useTranslation();
  return (damage: number, adjustment?: AttackDamageAdjustment | null): string =>
    adjustment && adjustment.multiplier !== 1
      ? t('damage-scaled', {
          damage,
          base: adjustment.baseDamage,
          multiplier: formatMultiplier(adjustment.multiplier, i18n?.language),
        })
      : String(damage);
};

/** The severity moved by the sizes, the charge or the style (spec 075) actually changed. */
export const severityChanged = (adjustment?: AttackSeverityAdjustment | null): adjustment is AttackSeverityAdjustment =>
  !!adjustment && (adjustment.final !== adjustment.original || adjustment.steps.some((step) => step.value !== 0));

/**
 * The critical of the table and the one that applies, `Critical SC → SD`, explaining each step that moved it (§9.4,
 * workspace spec 075). A removed critical shows a dash.
 */
export const SeverityShiftChip: FC<{ criticalType?: string | null; adjustment: AttackSeverityAdjustment }> = ({
  criticalType,
  adjustment,
}) => {
  const { t } = useTranslation();
  const original = criticalCode(criticalType, adjustment.original);
  const final = adjustment.final ? criticalCode(criticalType, adjustment.final) : '—';
  const steps = adjustment.steps.filter((step) => step.value !== 0);
  return (
    <Box component="span" sx={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <RuleHint
        title={t('severity-shift-title')}
        reference="§9.4"
        description={
          <Stack component="span" spacing={0.25}>
            {steps.map((step) => (
              <Stack component="span" key={step.key} direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
                <Typography component="span" variant="body2" color="text.secondary">
                  {t(`severity-shift-${step.key}`, { defaultValue: step.key })}
                </Typography>
                <Typography component="span" variant="body2" sx={{ fontWeight: 600 }}>
                  {signed(step.value)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        }
      >
        <RmuChip variant="outcome" tone="error" label={t('critical-code', { code: `${original} → ${final}` })} />
      </RuleHint>
    </Box>
  );
};

/** The sizes took the critical below A (§9.4, spec 075 decision 4): it is not rolled. */
export const CriticalRemovedAlert: FC<{ adjustment?: AttackSeverityAdjustment | null }> = ({ adjustment }) => {
  const { t } = useTranslation();
  if (!adjustment || adjustment.final !== null) return null;
  return (
    <Alert severity="info" variant="outlined">
      {t('critical-below-a-none', { severity: adjustment.original })}
    </Alert>
  );
};
