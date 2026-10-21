import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Chip, LinearProgress, Stack, Typography } from '@mui/material';
import { formatBonus, RollBreakdown } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { Action, ActionAttack, ActionManeuverEffect } from '../../../api/action.dto';
import { AttackResultSummary } from '../../action-dialogs/attack/AttackResolutionGuide';
import ResolveAttackInfo from '../../action-dialogs/attack/ResolveAttackInfo';
import { isFailureResult, isPercentResult, isSuccessResult } from './maneuver/maneuver-form';
import ResultValues from './ResultValues';

// Results of a resolved (or partly resolved) action, shown in the resolution dialog and in the side panel.

export const MovementResult: FC<{ action: Action }> = ({ action }) => {
  const { t } = useTranslation();
  const { strategicGame } = useContext(CombatContext)!;
  const calculated = action.movement?.calculated;
  if (!calculated) return null;
  const scale = strategicGame?.options?.boardScaleMultiplier || 1;
  return (
    <Stack spacing={2}>
      <ResultValues
        values={[
          { label: t('distance'), value: `${calculated.distance}'` },
          ...(scale !== 1 ? [{ label: t('adjusted-distance'), value: calculated.distanceAdjusted }] : []),
          {
            label: t('percent'),
            value: `${calculated.percent}%`,
            tone: calculated.percent < 100 ? 'negative' : undefined,
          },
          { label: t('fatigue'), value: action.fatigue || 0 },
          ...(calculated.critical
            ? [{ label: t('received-critical'), value: `${calculated.critical}K`, tone: 'negative' as const }]
            : []),
        ]}
      />
      {action.movement?.roll?.modifiers && <RollBreakdown modifiers={action.movement.roll.modifiers} />}
    </Stack>
  );
};

const effectLabel = (effect: ActionManeuverEffect, t: TFunction) =>
  [
    t(effect.status, { defaultValue: effect.status }),
    effect.value !== undefined && effect.value !== null ? formatBonus(effect.value) : null,
    effect.modifier ? t(effect.modifier, { defaultValue: effect.modifier }) : null,
    effect.rounds ? `${effect.rounds} ${t('rounds')}` : null,
  ]
    .filter(Boolean)
    .join(' ');

/**
 * Result of a maneuver: an absolute one as a chip (green for any success, red for a failure) with its message,
 * unusual event and effects; a percent one as its percent and the task progress over the rounds.
 */
export const ManeuverResult: FC<{ action: Action }> = ({ action }) => {
  const { t } = useTranslation();
  const maneuver = action.maneuver;
  const result = maneuver?.result;
  if (!result) return null;
  const percent = isPercentResult(result);
  const progress = maneuver?.progress ?? result.percent ?? 0;
  const tone = isSuccessResult(result.result) ? 'success' : isFailureResult(result.result) ? 'error' : 'warning';
  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        {percent ? (
          <Chip
            label={`${result.percent}%`}
            color={result.completed ? 'success' : (result.percent ?? 0) > 0 ? 'primary' : 'error'}
          />
        ) : (
          result.result && <Chip label={t(result.result)} color={tone} />
        )}
        {result.unusualEvent && <Chip label={t('unusual-event')} color="warning" variant="outlined" />}
        {result.critical && <Chip label={`${t('critical')} ${result.critical}`} color="error" variant="outlined" />}
        {maneuver?.roll?.totalRoll !== undefined && (
          <Typography variant="body2" color="text.secondary">
            {t('total-value', { value: maneuver.roll.totalRoll })}
          </Typography>
        )}
      </Stack>
      {percent && (
        <Stack spacing={0.5} sx={{ maxWidth: 360 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              {t('maneuver-progress', { value: progress })}
            </Typography>
            <Typography variant="body2" color={result.completed ? 'success.main' : 'text.secondary'}>
              {result.completed ? t('maneuver-completed') : t('maneuver-in-progress')}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, Math.max(0, progress))}
            color={result.completed ? 'success' : 'primary'}
          />
        </Stack>
      )}
      {result.message && (
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
          {result.message}
        </Typography>
      )}
      {result.effects && result.effects.length > 0 && (
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
          {result.effects.map((effect, index) => (
            <Chip key={`${effect.status}-${index}`} size="small" variant="outlined" label={effectLabel(effect, t)} />
          ))}
        </Stack>
      )}
      <ResultValues values={[{ label: t('fatigue'), value: action.fatigue || 0 }]} />
      {maneuver?.roll?.modifiers && <RollBreakdown modifiers={maneuver.roll.modifiers} />}
    </Stack>
  );
};

/** Per attack: what it does to its target once rolled, and the breakdown of its roll. */
export const AttackResults: FC<{ attacks: ActionAttack[] }> = ({ attacks }) => {
  const { actorRounds } = useContext(CombatContext)!;
  const targetName = (targetId: string) => actorRounds?.find((ar) => ar.actorId === targetId)?.actorName ?? '';
  return (
    <Stack spacing={1.5}>
      {attacks.map((attack) => (
        <Stack key={attack.attackName} spacing={1}>
          <AttackResultSummary attack={attack} targetName={targetName(attack.modifiers.targetId)} />
          <ResolveAttackInfo attack={attack} />
        </Stack>
      ))}
    </Stack>
  );
};
