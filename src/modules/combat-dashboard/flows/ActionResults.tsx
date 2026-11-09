import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, LinearProgress, Stack, Typography } from '@mui/material';
import { AdrenalManeuverOutcome, ChipRow, formatBonus, RollBreakdown } from '@labcabrera-rmu/rmu-react-shared-lib';
import type { TFunction } from 'i18next';
import { Action, ActionAttack, ActionManeuverEffect } from '../../api/action.dto';
import { useCombatGame, useCombatRound } from '../../combat/combat-context';
import ResultValues from './ResultValues';
import BreakdownColumns from './attack/BreakdownColumns';
import { AttackResultSummary } from './attack/resolve/AttackResolutionGuide';
import ResolveAttackInfo from './attack/resolve/ResolveAttackInfo';
import SpecialManeuverResult from './attack/resolve/SpecialManeuverResult';
import { isFailureResult, isPercentResult, isSuccessResult } from './maneuver/maneuver-form';

// Results of a resolved (or partly resolved) action, shown in the resolution dialog and in the side panel.

export const MovementResult: FC<{ action: Action }> = ({ action }) => {
  const { t } = useTranslation();
  const { strategicGame } = useCombatGame();
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
          { label: t('fatigue'), value: Number((action.fatigue || 0).toFixed(1)) },
          // Workspace spec 077: what changed the BMR (half movement, concentration)
          ...(calculated.bmrMultipliers ?? []).map((multiplier) => ({
            label: t(`bmr-multiplier-${multiplier.key}`),
            value: `${t('bmr')} ×${multiplier.value}`,
          })),
          ...(calculated.critical
            ? [{ label: t('received-critical'), value: `${calculated.critical}K`, tone: 'negative' as const }]
            : []),
        ]}
      />
      {action.movement?.roll?.modifiers && (
        <RollBreakdown
          context="maneuver"
          modifiers={action.movement.roll.modifiers}
          skipped={action.movement.roll.skipped}
        />
      )}
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

/** The benefit of an adrenal move or Fortitude, its rounds and from when, and a block or the fatigue it added. */
const AdrenalOutcomeChips: FC<{ outcome: AdrenalManeuverOutcome }> = ({ outcome }) => {
  const { t } = useTranslation();
  return (
    <>
      {outcome.rounds > 0 && (
        <Chip
          variant="outlined"
          color="success"
          label={[
            t(outcome.kind === 'fortitude' ? 'fortitude' : `adrenal-${outcome.kind}`),
            t('rounds-short', { count: outcome.rounds }),
            outcome.fromRound ? t('effect-from-round', { round: outcome.fromRound }) : null,
          ]
            .filter(Boolean)
            .join(' ')}
        />
      )}
      {outcome.doubled && <Chip variant="outlined" color="success" label={t('adrenal-doubled')} />}
      {outcome.partial && <Chip variant="outlined" color="warning" label={t('adrenal-partial')} />}
      {outcome.block && <Chip variant="outlined" color="error" label={t('adrenal-block')} />}
      {outcome.blockLifted && <Chip variant="outlined" color="success" label={t('adrenal-block-lifted')} />}
      {!!outcome.fatigue && (
        <Chip variant="outlined" color="error" label={t('fortitude-fatigue', { value: outcome.fatigue })} />
      )}
    </>
  );
};

/**
 * Result of a maneuver: an absolute one as a chip (green for any success, red for a failure) with its message,
 * unusual event and effects; a percent one as its percent and the task progress over the rounds; Trading as the
 * price, and Leadership with the outcome of the morale table and its modifier to later morale rolls.
 */
export const ManeuverResult: FC<{ action: Action }> = ({ action }) => {
  const { t } = useTranslation();
  const { actorRounds } = useCombatRound();
  const targetId = action.maneuver?.modifiers.targetActorId;
  const targetName = targetId ? actorRounds?.find((each) => each.actorId === targetId)?.actorName : undefined;
  const maneuver = action.maneuver;
  const result = maneuver?.result;
  if (!result) return null;
  // Trading gives a price instead of progress (spec 022, decision 11).
  const price = result.price !== undefined && result.price !== null;
  const percent = isPercentResult(result) && !price;
  const progress = maneuver?.progress ?? result.percent ?? 0;
  const tone = isSuccessResult(result.result) ? 'success' : isFailureResult(result.result) ? 'error' : 'warning';
  return (
    <Stack spacing={2}>
      <ChipRow>
        {price ? (
          <Chip label={t('trading-price', { value: result.price })} color="primary" />
        ) : percent ? (
          <Chip
            label={`${result.percent}%`}
            color={result.completed ? 'success' : (result.percent ?? 0) > 0 ? 'primary' : 'error'}
          />
        ) : (
          result.result && <Chip label={t(result.result)} color={tone} />
        )}
        {result.unusualEvent && <Chip label={t('unusual-event')} color="warning" variant="outlined" />}
        {result.critical && <Chip label={`${t('critical')} ${result.critical}`} color="error" variant="outlined" />}
        {targetName && <Chip label={t('maneuver-against', { name: targetName })} variant="outlined" />}
        {/* Workspace spec 077: the steps a fall-control maneuver moves the critical of a fall */}
        {result.fallControlSteps !== undefined && result.fallControlSteps !== null && (
          <Chip
            variant="outlined"
            color={result.fallControlSteps < 0 ? 'success' : result.fallControlSteps > 0 ? 'error' : 'default'}
            label={t('fall-control-steps', {
              steps: result.fallControlSteps > 0 ? `+${result.fallControlSteps}` : `${result.fallControlSteps}`,
            })}
          />
        )}
        {/* Workspace spec 079, B3-B4: what an adrenal move or Fortitude gave */}
        {result.adrenal && <AdrenalOutcomeChips outcome={result.adrenal} />}
        {result.featOfStrength && (
          <Chip
            variant="outlined"
            label={t('feat-of-strength-result', {
              adjusted: result.featOfStrength.adjustedPercent,
              difficulty: t(`difficulty-${result.featOfStrength.difficulty}`),
            })}
          />
        )}
        {maneuver?.roll?.totalRoll !== undefined && (
          <Typography variant="body2" color="text.secondary">
            {t('total-value', { value: maneuver.roll.totalRoll })}
          </Typography>
        )}
      </ChipRow>
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
      {price && (
        <Typography variant="body2" color="text.secondary">
          {t('trading-price-help', { percent: result.percent ?? 0, value: result.price })}
        </Typography>
      )}
      {result.outcome && (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {t(`morale-outcome-${result.outcome}`)}
        </Typography>
      )}
      {result.moraleModifier ? (
        <Typography variant="body2" color="warning.main">
          {t('morale-modifier-warning', {
            value: formatBonus(result.moraleModifier),
            count: result.moraleModifierDays ?? 0,
          })}
        </Typography>
      ) : null}
      {result.message && (
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
          {result.message}
        </Typography>
      )}
      {result.effects && result.effects.length > 0 && (
        <ChipRow>
          {result.effects.map((effect, index) => (
            <Chip key={`${effect.status}-${index}`} size="small" variant="outlined" label={effectLabel(effect, t)} />
          ))}
        </ChipRow>
      )}
      <ResultValues values={[{ label: t('fatigue'), value: Number((action.fatigue || 0).toFixed(1)) }]} />
      {maneuver?.roll?.modifiers && (
        <RollBreakdown context="maneuver" modifiers={maneuver.roll.modifiers} skipped={maneuver.roll.skipped} />
      )}
    </Stack>
  );
};

/** Per attack: what it does to its target once rolled, and the breakdown of its roll. */
export const AttackResults: FC<{ attacks: ActionAttack[]; sourceActorId?: string }> = ({ attacks, sourceActorId }) => {
  const { actorRounds } = useCombatRound();
  const targetName = (targetId: string) => actorRounds?.find((ar) => ar.actorId === targetId)?.actorName ?? '';
  return (
    <Stack spacing={1.5}>
      {attacks.map((attack) => (
        <BreakdownColumns
          key={attack.attackName}
          breakdown={<ResolveAttackInfo attack={attack} sourceActorId={sourceActorId} />}
        >
          <Stack spacing={1}>
            <AttackResultSummary attack={attack} targetName={targetName(attack.modifiers.targetId)} />
            <SpecialManeuverResult attack={attack} />
          </Stack>
        </BreakdownColumns>
      ))}
    </Stack>
  );
};
