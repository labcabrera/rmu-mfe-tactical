import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Chip, Stack, Tooltip, Typography } from '@mui/material';
import {
  ChipRow,
  DataTable,
  formatBonus,
  RollBreakdown,
  RollResultAlert,
  SectionLabel,
  TemporaryModifierList,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActorCheckResult, ActorCheckStatus, GroupCheckResult } from '../../api/psychology.dto';

const STATUS_COLOR: Record<ActorCheckStatus, 'default' | 'success' | 'warning' | 'info'> = {
  skipped: 'default',
  resisted: 'success',
  afraid: 'warning',
  follower: 'info',
};

const breakdownText = (actor: ActorCheckResult, label: (key: string) => string) =>
  (actor.breakdown ?? []).map((modifier) => `${label(modifier.key)} ${formatBonus(modifier.value)}`).join(' · ');

/**
 * Result of a group check: the leader's roll and what it gives (the morale outcome and its modifier, the steps the
 * fear of the followers changes by), and one row per actor with its RR, the fear effect before and after and what
 * the turn cannot do or the game master has to apply.
 */
const GroupCheckResultView: FC<{ result: GroupCheckResult; factionName: (id: string) => string }> = ({
  result,
  factionName,
}) => {
  const { t } = useTranslation();
  const label = (key: string) => t(key, { defaultValue: key });
  const effect = (status: string | undefined) => (status ? t(status) : '—');
  const leaderRoll = result.leaderRoll;
  // ADR 0007 S3 (workspace spec 068): the followers without a fear RR bonus are left out of the average of a morale
  // check; the actors down are left out of every check.
  const withoutBonus =
    result.kind === 'morale'
      ? result.actors.filter((actor) => actor.status === 'follower' && actor.warnings.includes('no-fear-rr-bonus'))
      : [];
  const skipped = result.actors.filter((actor) => actor.status === 'skipped');
  const leaderName =
    result.actorRounds.find((actorRound) => actorRound.actorId === result.leader?.actorId)?.actorName ??
    result.actors.find((actor) => actor.actorId === result.leader?.actorId)?.actorName;

  return (
    <Stack spacing={2}>
      {result.frightLevel !== undefined && (
        <Typography variant="body2">{t('fright-level-value', { value: result.frightLevel })}</Typography>
      )}
      {result.leader && (
        <Typography variant="body2" color="text.secondary">
          {t('leader-summary', {
            ranks: result.leader.leadershipRanks,
            bonus: formatBonus(result.leader.fearRrBonus),
          })}
          {result.leader.recognized ? '' : ` · ${t('leader-not-recognized')}`}
        </Typography>
      )}
      {leaderRoll && (
        <RollResultAlert
          severity={result.outcome === 'refuses-hostile' || result.outcome === 'refuses' ? 'warning' : 'info'}
          headline={[
            leaderRoll.result ? t(leaderRoll.result) : null,
            `${t('total')} ${leaderRoll.total}`,
            leaderRoll.rolledByServer ? t('rolled-by-server') : null,
          ]
            .filter(Boolean)
            .join(' · ')}
          lines={[
            result.outcome && t(`morale-outcome-${result.outcome}`),
            result.moraleModifier
              ? result.moraleModifierDays
                ? t('morale-modifier-warning', {
                    value: formatBonus(result.moraleModifier),
                    count: result.moraleModifierDays,
                  })
                : t('morale-modifier-warning-until-lifted', { value: formatBonus(result.moraleModifier) })
              : null,
            result.fearSeverityChange !== undefined &&
              (result.fearSeverityChange < 0
                ? t('rally-calms', { count: -result.fearSeverityChange })
                : result.fearSeverityChange > 0
                  ? t('rally-worsens', { count: result.fearSeverityChange })
                  : t('rally-no-change')),
            leaderRoll.unusualEvent && (
              <Box component="strong" sx={{ fontWeight: 600 }}>
                {t(`unusual-${leaderRoll.unusualEvent.outcome}`, {
                  bonus: leaderRoll.unusualEvent.leaderFearRrBonus ?? 0,
                  hits: leaderRoll.unusualEvent.leaderHits ?? 0,
                })}
              </Box>
            ),
          ]}
          breakdown={<RollBreakdown context="fear-rr" modifiers={leaderRoll.breakdown} total={leaderRoll.total} />}
        />
      )}

      {(withoutBonus.length > 0 || skipped.length > 0) && (
        <Alert severity="info" variant="outlined">
          {withoutBonus.length > 0 && (
            <Typography variant="body2">
              {t('morale-average-excluded', {
                count: withoutBonus.length,
                names: withoutBonus.map((actor) => actor.actorName).join(', '),
              })}
            </Typography>
          )}
          {skipped.length > 0 && (
            <Typography variant="body2">
              {t('group-check-skipped', {
                count: skipped.length,
                names: skipped.map((actor) => actor.actorName).join(', '),
              })}
            </Typography>
          )}
        </Alert>
      )}
      {(result.temporaryModifiers ?? []).length > 0 && (
        <Stack spacing={0.5}>
          <SectionLabel>
            {leaderName ? t('temporary-modifiers-of', { actor: leaderName }) : t('temporary-modifiers')}
          </SectionLabel>
          <TemporaryModifierList modifiers={result.temporaryModifiers ?? []} />
        </Stack>
      )}

      <DataTable
        rows={result.actors}
        getKey={(actor) => actor.actorRoundId}
        columns={[
          {
            key: 'actor',
            header: t('actor'),
            render: (actor) => (
              <>
                <Typography variant="body2">{actor.actorName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {factionName(actor.factionId)}
                </Typography>
              </>
            ),
          },
          {
            key: 'status',
            header: t('status'),
            render: (actor) => (
              <Chip size="small" color={STATUS_COLOR[actor.status]} label={t(`group-status-${actor.status}`)} />
            ),
          },
          {
            key: 'total',
            header: t('total'),
            align: 'right',
            render: (actor) =>
              actor.total !== undefined ? (
                <Tooltip title={breakdownText(actor, label)}>
                  <span>
                    {`${actor.total} / ${actor.required ?? ''}`}
                    {actor.rolledByServer ? ' *' : ''}
                  </span>
                </Tooltip>
              ) : (
                '—'
              ),
          },
          { key: 'failure', header: t('failure'), align: 'right', render: (actor) => actor.failure || '—' },
          {
            key: 'effect',
            header: t('effect'),
            render: (actor) =>
              actor.previousEffect !== actor.effect
                ? `${effect(actor.previousEffect)} → ${effect(actor.effect)}`
                : effect(actor.effect),
          },
          {
            key: 'notes',
            header: t('notes'),
            render: (actor) => (
              <ChipRow>
                {actor.restrictions.map((restriction) => (
                  <Chip
                    key={restriction}
                    size="small"
                    color="error"
                    variant="outlined"
                    label={t(`group-restriction-${restriction}`)}
                  />
                ))}
                {actor.warnings.map((warning) => (
                  <Chip
                    key={warning}
                    size="small"
                    variant="outlined"
                    label={t(`group-warning-${warning}`, { defaultValue: warning })}
                  />
                ))}
              </ChipRow>
            ),
          },
        ]}
      />
      {result.actors.some((actor) => actor.rolledByServer) && (
        <Typography variant="caption" color="text.secondary">
          {t('rolled-by-server-note')}
        </Typography>
      )}
      {result.actors.some((actor) => actor.effect && actor.effect !== actor.previousEffect) && (
        <Typography variant="caption" color="text.secondary">
          {t('fear-effects-help')}
        </Typography>
      )}
    </Stack>
  );
};

export default GroupCheckResultView;
