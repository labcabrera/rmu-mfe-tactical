import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { formatBonus, RollBreakdown } from '@labcabrera-rmu/rmu-react-shared-lib';
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
        <Alert severity={result.outcome === 'refuses-hostile' || result.outcome === 'refuses' ? 'warning' : 'info'}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {[
              leaderRoll.result ? t(leaderRoll.result) : null,
              `${t('total')} ${leaderRoll.total}`,
              leaderRoll.rolledByServer ? t('rolled-by-server') : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Typography>
          {result.outcome && <Typography variant="body2">{t(`morale-outcome-${result.outcome}`)}</Typography>}
          {result.moraleModifier ? (
            <Typography variant="body2">
              {t('morale-modifier-warning', {
                value: formatBonus(result.moraleModifier),
                count: result.moraleModifierDays ?? 0,
              })}
            </Typography>
          ) : null}
          {result.fearSeverityChange !== undefined && (
            <Typography variant="body2">
              {result.fearSeverityChange < 0
                ? t('rally-calms', { count: -result.fearSeverityChange })
                : result.fearSeverityChange > 0
                  ? t('rally-worsens', { count: result.fearSeverityChange })
                  : t('rally-no-change')}
            </Typography>
          )}
          {leaderRoll.unusualEvent && (
            <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>
              {t(`unusual-${leaderRoll.unusualEvent.outcome}`, {
                bonus: leaderRoll.unusualEvent.leaderFearRrBonus ?? 0,
                hits: leaderRoll.unusualEvent.leaderHits ?? 0,
              })}
            </Typography>
          )}
        </Alert>
      )}
      {leaderRoll && <RollBreakdown modifiers={leaderRoll.breakdown} total={leaderRoll.total} />}

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('actor')}</TableCell>
              <TableCell>{t('status')}</TableCell>
              <TableCell align="right">{t('total')}</TableCell>
              <TableCell align="right">{t('failure')}</TableCell>
              <TableCell>{t('effect')}</TableCell>
              <TableCell>{t('notes')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {result.actors.map((actor) => (
              <TableRow key={actor.actorRoundId}>
                <TableCell>
                  <Typography variant="body2">{actor.actorName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {factionName(actor.factionId)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip size="small" color={STATUS_COLOR[actor.status]} label={t(`group-status-${actor.status}`)} />
                </TableCell>
                <TableCell align="right">
                  {actor.total !== undefined ? (
                    <Tooltip title={breakdownText(actor, label)}>
                      <span>
                        {`${actor.total} / ${actor.required ?? ''}`}
                        {actor.rolledByServer ? ' *' : ''}
                      </span>
                    </Tooltip>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell align="right">{actor.failure ? actor.failure : '—'}</TableCell>
                <TableCell>
                  {actor.previousEffect !== actor.effect
                    ? `${effect(actor.previousEffect)} → ${effect(actor.effect)}`
                    : effect(actor.effect)}
                </TableCell>
                <TableCell>
                  <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                    {actor.restrictions.map((restriction) => (
                      <Chip key={restriction} size="small" color="error" variant="outlined" label={t(`group-restriction-${restriction}`)} />
                    ))}
                    {actor.warnings.map((warning) => (
                      <Chip
                        key={warning}
                        size="small"
                        variant="outlined"
                        label={t(`group-warning-${warning}`, { defaultValue: warning })}
                      />
                    ))}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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
