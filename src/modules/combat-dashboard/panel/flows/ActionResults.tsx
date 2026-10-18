import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, Stack, Typography } from '@mui/material';
import { RollBreakdown } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { Action, ActionAttack } from '../../../api/action.dto';
import { AttackResultSummary } from '../../action-dialogs/attack/AttackResolutionGuide';
import ResolveAttackInfo from '../../action-dialogs/attack/ResolveAttackInfo';
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

export const ManeuverResult: FC<{ action: Action }> = ({ action }) => {
  const { t } = useTranslation();
  const result = action.maneuver?.result;
  if (!result) return null;
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Chip label={t(result.result)} color={result.result === 'success' ? 'success' : 'error'} />
        {action.maneuver?.roll?.totalRoll !== undefined && (
          <Typography variant="body2" color="text.secondary">
            {t('total-value', { value: action.maneuver.roll.totalRoll })}
          </Typography>
        )}
      </Stack>
      {result.message && <Typography variant="body2">{result.message}</Typography>}
      <ResultValues values={[{ label: t('fatigue'), value: action.fatigue || 0 }]} />
      {action.maneuver?.roll?.modifiers && <RollBreakdown modifiers={action.maneuver.roll.modifiers} />}
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
