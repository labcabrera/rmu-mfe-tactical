import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Stack, Typography } from '@mui/material';
import { formatHpAmount, HpLogEntry, hpAmountColor } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActorRound } from '../api/actor-rounds.dto';

/** Phase 5 is the upkeep; 0 is before the action phases. */
const UPKEEP_PHASE = 5;

const HpLogRow: FC<{ entry: HpLogEntry }> = ({ entry }) => {
  const { t } = useTranslation();
  const when = [
    `${t('round')} ${entry.round}`,
    entry.phase === UPKEEP_PHASE
      ? t('upkeep')
      : entry.phase !== undefined && entry.phase !== null && entry.phase > 0
        ? t('phase-n', { phase: entry.phase })
        : undefined,
  ]
    .filter(Boolean)
    .join(' · ');
  const origin = [
    entry.criticalKey ? `${t(`hp-log-kind-${entry.kind}`)} ${entry.criticalKey}` : t(`hp-log-kind-${entry.kind}`),
    entry.attackerName ? `${t('attacker')}: ${entry.attackerName}` : undefined,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
      <Typography
        variant="body2"
        sx={{ color: hpAmountColor(entry.amount), fontWeight: 600, minWidth: 40, fontVariantNumeric: 'tabular-nums' }}
      >
        {formatHpAmount(entry.amount)}
      </Typography>
      <Stack sx={{ minWidth: 0 }}>
        <Typography variant="body2">{origin}</Typography>
        <Typography variant="caption" color="text.secondary">
          {when}
        </Typography>
      </Stack>
    </Stack>
  );
};

/**
 * Hit point changes of the displayed round (spec 013, §1.1): amount, origin (attack, critical with its key, bleeding,
 * treatment...), attacker and phase. Collapsed unless `defaultExpanded` (the health tab of the actor sheet).
 */
const ActorRoundHpLog: FC<{ actorRound: ActorRound; defaultExpanded?: boolean }> = ({
  actorRound,
  defaultExpanded = false,
}) => {
  const { t } = useTranslation();
  const entries = actorRound.hpLog ?? [];
  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <Accordion
      disableGutters
      variant="outlined"
      defaultExpanded={defaultExpanded}
      sx={{ '&:before': { display: 'none' } }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
          <Typography variant="subtitle2">{t('hp-log')}</Typography>
          {entries.length > 0 && (
            <Typography variant="caption" sx={{ color: hpAmountColor(total) }}>
              {t('hp-log-total', { count: entries.length, total: formatHpAmount(total) })}
            </Typography>
          )}
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        {entries.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('hp-log-empty')}
          </Typography>
        ) : (
          <Stack spacing={0.75}>
            {entries.map((entry) => (
              <HpLogRow key={entry.id} entry={entry} />
            ))}
          </Stack>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default ActorRoundHpLog;
