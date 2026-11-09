import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, Stack, Typography } from '@mui/material';
import {
  ActorRoundHazardBlockAFields,
  ChipRow,
  formatBonus,
  formatMultiplier,
  RuleHint,
  signedSteps,
  useTableText,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import type { TFunction } from 'i18next';
import { ActorRoundHazard } from '../../api/actor-rounds.dto';
import { criticalCode } from '../../services/action-service';

/** What fell, in one line: "Fall · 20 ft" or "Falling object · Big · 20 ft". */
export const hazardTitle = (hazard: ActorRoundHazard, t: TFunction) =>
  hazard.temperature
    ? [
        t(`hazard-kind-${hazard.kind}`),
        t(`temperature-kind-${hazard.temperature.kind}`),
        hazard.temperature.celsius !== null ? `${hazard.temperature.celsius} °C` : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : [
        t(`hazard-kind-${hazard.kind}`),
        hazard.kind === 'falling-object' && hazard.objectSize ? t(`size-${hazard.objectSize}`) : null,
        t('hazard-feet', { feet: hazard.distanceFeet }),
      ]
        .filter(Boolean)
        .join(' · ');

/** The criticals of a hazard, each rolled or left as an alert, and its note. */
const HazardCriticals: FC<{ hazard: ActorRoundHazard }> = ({ hazard }) => {
  const { t } = useTranslation();
  // Workspace spec 086: the English text of a table entry, translated when there is one
  const tableText = useTableText();
  return (
    <>
      {hazard.criticals.map((critical, index) => (
        <Box key={`${critical.criticalType}-${index}`} sx={{ borderLeft: 3, borderColor: 'divider', pl: 1.5 }}>
          <ChipRow>
            <Chip size="small" color="error" label={criticalCode(critical.criticalType, critical.criticalSeverity)} />
            {critical.roll !== null ? (
              <>
                <Typography variant="caption" color="text.secondary">
                  {[
                    `${t('critical-roll')} ${critical.roll}`,
                    critical.location ? t(critical.location) : null,
                    critical.damage ? t('hazard-critical-damage', { damage: critical.damage }) : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Typography>
              </>
            ) : (
              <Chip size="small" variant="outlined" color="warning" label={t('hazard-critical-pending')} />
            )}
          </ChipRow>
          {critical.text && (
            <Typography variant="caption" color="text.secondary" component="div">
              {tableText(critical.text)}
            </Typography>
          )}
        </Box>
      ))}
      {hazard.note && (
        <Typography variant="caption" color="text.secondary">
          {hazard.note}
        </Typography>
      )}
    </>
  );
};

/**
 * Result of a fall or a falling object (workspace spec 077, decisions D1-D2): the table and its OB against the DB, the
 * roll and total, the damage with the Hit Multiplier of its size, the severity of the critical with the steps that moved
 * it (sizes, Light-boned, code I, fall control) and each critical, rolled or left as an alert.
 */
const HazardResult: FC<{ hazard: ActorRoundHazard & ActorRoundHazardBlockAFields }> = ({ hazard }) => {
  const { t, i18n } = useTranslation();
  // Workspace spec 079, decision A4: the hazard of a knock-back gives no critical worse than the one that provoked it
  const cap = hazard.severityCap ?? null;
  const steps = hazard.severitySteps.filter((step) => step.value !== 0);
  const severityMoved = hazard.originalSeverity !== hazard.severity || steps.length > 0;
  const damage =
    hazard.multiplier !== 1
      ? t('damage-scaled', {
          damage: hazard.damage,
          base: hazard.baseDamage,
          multiplier: formatMultiplier(hazard.multiplier, i18n?.language),
        })
      : String(hazard.damage);

  // Workspace spec 079, C3: an extreme temperature has no attack roll, only its critical
  if (hazard.temperature) {
    return (
      <Stack spacing={1}>
        <ChipRow>
          <RuleHint
            title={t('hazard-kind-extreme-temperature')}
            description={t(`hazard-temperature-source-${hazard.temperature.severitySource}`)}
            reference="§15.3"
          >
            <Chip
              size="small"
              color="error"
              variant="outlined"
              label={t('critical-code', { code: criticalCode(hazard.temperature.criticalType, hazard.severity) })}
              sx={{ cursor: 'inherit' }}
            />
          </RuleHint>
        </ChipRow>
        <HazardCriticals hazard={hazard} />
      </Stack>
    );
  }

  return (
    <Stack spacing={1}>
      <ChipRow>
        {hazard.attackTable && <Chip size="small" label={t(hazard.attackTable)} />}
        <Chip size="small" variant="outlined" label={t('hazard-ob-value', { value: formatBonus(hazard.ob) })} />
        <Chip size="small" variant="outlined" label={t('hazard-db-value', { value: formatBonus(hazard.db) })} />
        <Chip size="small" variant="outlined" label={t('hazard-at-value', { value: hazard.armor })} />
        {hazard.attackSize !== 0 && (
          <Chip
            size="small"
            variant="outlined"
            label={t('hazard-attack-size', { steps: signedSteps(hazard.attackSize) })}
          />
        )}
      </ChipRow>
      <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
        {t('hazard-roll-total', { roll: hazard.roll, total: hazard.total, text: hazard.text || '—' })}
      </Typography>
      <ChipRow>
        <Chip size="small" color={hazard.damage > 0 ? 'error' : 'default'} label={t('hazard-damage', { damage })} />
        {hazard.severity || hazard.originalSeverity ? (
          <RuleHint
            title={t('severity-shift-title')}
            reference="§15.4"
            description={
              steps.length > 0 ? (
                <Stack component="span" spacing={0.25}>
                  {steps.map((step) => (
                    <Stack
                      component="span"
                      key={step.key}
                      direction="row"
                      sx={{ justifyContent: 'space-between', gap: 2 }}
                    >
                      <Typography component="span" variant="body2" color="text.secondary">
                        {t(`severity-shift-${step.key}`, { defaultValue: step.key })}
                      </Typography>
                      <Typography component="span" variant="body2" sx={{ fontWeight: 600 }}>
                        {signedSteps(step.value)}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                t('hazard-severity-unchanged')
              )
            }
          >
            <Chip
              size="small"
              color="error"
              variant="outlined"
              label={
                severityMoved
                  ? t('critical-code', {
                      code: `${hazard.originalSeverity ?? '—'} → ${hazard.severity ?? '—'}`,
                    })
                  : t('critical-code', { code: hazard.severity ?? '—' })
              }
              sx={{ cursor: 'inherit' }}
            />
          </RuleHint>
        ) : null}
        {hazard.fallControlSteps !== 0 && (
          <Chip
            size="small"
            variant="outlined"
            color={hazard.fallControlSteps < 0 ? 'success' : 'error'}
            label={t('fall-control-steps', { steps: signedSteps(hazard.fallControlSteps) })}
          />
        )}
        {cap && (
          <RuleHint title={t('alert-knocked-back')} description={t('hazard-severity-cap-help')} reference="§9.8">
            <Chip
              size="small"
              variant="outlined"
              color="warning"
              label={t('hazard-severity-cap', { severity: cap })}
              sx={{ cursor: 'inherit' }}
            />
          </RuleHint>
        )}
      </ChipRow>
      <HazardCriticals hazard={hazard} />
    </Stack>
  );
};

export default HazardResult;
