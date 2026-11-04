import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Box, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import {
  ChipRow,
  D100,
  FlowStep,
  NumberPadField,
  OPEN_D100,
  RollBreakdown,
  RollField,
  RollModifier,
  RollResultAlert,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { resolveMedical } from '../../../api/action';
import {
  Action,
  ActionMedical,
  MEDICAL_AP_PER_ROUND,
  MedicalStepResult,
  ResolveMedicalDto,
} from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import { isActionClosed } from '../../../services/ap-service';
import { actorOpenEnded } from '../../../services/combat-talents-service';
import { useTacticalNotify } from '../../../services/notify-service';
import ActionFlow from '../ActionFlow';

/** Keys of the breakdown of a step that are not modifiers of the roll: they are shown as text. */
const NOT_ROLL_KEYS = ['roll', 'rounds', 'stabilize'];

const RESULT_SEVERITY: Record<string, 'error' | 'warning' | 'info' | 'success'> = {
  'absolute-failure': 'error',
  failure: 'warning',
  'partial-success': 'info',
  success: 'success',
  'absolute-success': 'success',
};

/** Where a medical action stands with the AP it has: the rounds of 4 AP reached, and what can be resolved now. */
export const medicalProgress = (action: Action, medical: ActionMedical) => {
  const ap = action.actionPoints ?? 0;
  const due = Math.min(medical.rounds, Math.floor(ap / MEDICAL_AP_PER_ROUND));
  const stabilize = medical.procedure === 'stabilize';
  const open = medical.state === 'pending' || medical.state === 'in-progress';
  // As rmu-api-tactical: the first step and each stabilize roll once a round of AP is reached; the last one at the end
  const resolvable =
    open && (stabilize || medical.state === 'pending' ? due > medical.resolvedSteps : due >= medical.rounds);
  const first = medical.state === 'pending';
  const completes = !stabilize && due >= medical.rounds;
  return { ap, due, stabilize, resolvable, first, completes, neededAp: medical.rounds * MEDICAL_AP_PER_ROUND };
};

/**
 * A `medical` action (workspace spec 068, decisions 2 to 6): the patient, what is treated and the procedure; its
 * progress (state, rounds of 4 AP done over the rounds it takes, the AP it has, carried ones included) and the rounds
 * already resolved with their breakdown. Only the first round (the Medicine roll, which starts the treatment) and the
 * last one (it applies the treatment) are resolved; `stabilize` takes one roll per resolve. Rolls left empty are
 * rolled by the API.
 */
const MedicalFlow: FC<{
  action: Action;
  actorRound: ActorRound;
  onDeleted: () => void;
  onNextPending?: () => void;
}> = ({ action, actorRound, onDeleted, onNextPending }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const { actorRounds, updateAction, refreshActorRounds } = useContext(CombatContext)!;
  const [roll, setRoll] = useState<{ total: number; unmodified: number } | null>(null);
  const [herbalismRoll, setHerbalismRoll] = useState<number | null>(null);
  const [heatHitsRoll, setHeatHitsRoll] = useState<number | null>(null);
  const [heatCriticalRoll, setHeatCriticalRoll] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const medical = action.medical;
  const done = isActionClosed(action);

  if (!medical) {
    return (
      <ActionFlow
        action={action}
        steps={[
          {
            id: 'medical',
            label: t('medical'),
            content: <Alert severity="warning">{t('err-medical-required')}</Alert>,
          },
        ]}
        activeIndex={0}
        onDeleted={onDeleted}
        onNextPending={onNextPending}
      />
    );
  }

  const progress = medicalProgress(action, medical);
  const patient = actorRounds?.find((each) => each.actorId === medical.patientActorId);
  const injury = patient?.injuries?.find((each) => each.id === medical.injuryId);
  const dying = patient?.effects?.find((each) => each.id === medical.effectId);
  const targetText = medical.effectId
    ? [
        t('dying'),
        dying?.rounds !== undefined ? t('rounds-short', { count: dying.rounds }) : null,
        dying?.causeTreated ? t('dying-cause-treated') : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : injury
      ? [
          t(`injury-type-${injury.type ?? 'unknown'}`),
          t(`injury-severity-${injury.severity}`),
          injury.location && t(injury.location),
        ]
          .filter(Boolean)
          .join(' · ')
      : t('injury');
  const askRoll = progress.first || progress.stabilize;
  const askHerbalism = progress.first && !!medical.herbalism && medical.herbalism.roll === null;
  const askHeat = medical.procedure === 'cauterize' && progress.completes;

  const resolve = () => {
    const dto: ResolveMedicalDto = {
      ...(askRoll && roll
        ? { roll: roll.total, ...(roll.unmodified !== roll.total ? { unmodifiedRoll: roll.unmodified } : {}) }
        : {}),
      ...(askHerbalism && herbalismRoll !== null ? { herbalismRoll } : {}),
      ...(askHeat && heatHitsRoll !== null ? { heatHitsRoll } : {}),
      ...(askHeat && heatCriticalRoll !== null ? { heatCriticalRoll } : {}),
    };
    setBusy(true);
    resolveMedical(action.id, dto, auth)
      .then((updated) => {
        updateAction(updated);
        // The patient's injury or dying effect changed (and the healer's herbs)
        refreshActorRounds();
        const step = updated.medical?.results[updated.medical.results.length - 1];
        notify.success(
          step?.removed
            ? t('medical-dying-removed')
            : updated.medical?.state === 'completed'
              ? t('medical-completed', { procedure: t(`procedure-${medical.procedure}`) })
              : t('medical-step-resolved')
        );
        setRoll(null);
        setHerbalismRoll(null);
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  const resolveLabel = progress.stabilize
    ? t('medical-resolve-stabilize')
    : progress.first && progress.completes
      ? t('medical-resolve-start-complete')
      : progress.first
        ? t('medical-resolve-start')
        : t('medical-resolve-complete');

  const waiting = !progress.resolvable && !done && (medical.state === 'pending' || medical.state === 'in-progress');
  const progressView = (
    <Stack spacing={1}>
      <ChipRow>
        <Chip
          size="small"
          color={medical.state === 'aborted' ? 'error' : medical.state === 'completed' ? 'success' : 'warning'}
          label={t(`medical-state-${medical.state}`)}
        />
        <Chip
          size="small"
          variant="outlined"
          label={t('medical-rounds-done', { done: Math.min(progress.due, medical.rounds), total: medical.rounds })}
        />
        <Chip
          size="small"
          variant="outlined"
          label={t('ap-of-max', { ap: Math.min(progress.ap, progress.neededAp), max: progress.neededAp })}
        />
        {medical.roundsOverride && <Chip size="small" variant="outlined" label={t('medical-rounds-chosen')} />}
        {medical.startedRound !== null && (
          <Chip size="small" variant="outlined" label={t('medical-started-round', { round: medical.startedRound })} />
        )}
      </ChipRow>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, (100 * Math.min(progress.ap, progress.neededAp)) / Math.max(1, progress.neededAp))}
        aria-label={t('progress')}
      />
      {waiting && (
        <Typography variant="caption" color="text.secondary">
          {medical.state === 'pending' || progress.stabilize
            ? t('medical-waiting-step', { ap: (medical.resolvedSteps + 1) * MEDICAL_AP_PER_ROUND })
            : t('medical-waiting-complete', { ap: progress.neededAp })}
        </Typography>
      )}
      {medical.results.map((step) => (
        <MedicalStepView key={`${step.round}-${step.step}`} step={step} />
      ))}
    </Stack>
  );

  const rolls = (
    <Stack spacing={2}>
      {progressView}
      {!done && progress.resolvable && (
        <>
          {askRoll && (
            <RollField
              spec={OPEN_D100}
              label={t('medical-medicine-roll')}
              value={roll?.total ?? null}
              onChange={(value) => setRoll({ total: value.total, unmodified: value.unmodified })}
              onClear={() => setRoll(null)}
              placeholder={t('roll-by-server')}
              disabled={busy}
              openEnded={actorOpenEnded(actorRound)}
            />
          )}
          {askHerbalism && (
            <RollField
              spec={OPEN_D100}
              label={t('medical-herbalism-roll')}
              value={herbalismRoll}
              onChange={(value) => setHerbalismRoll(value.total)}
              onClear={() => setHerbalismRoll(null)}
              placeholder={t('roll-by-server')}
              disabled={busy}
            />
          )}
          {askHeat && (
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary">
                {t('cauterize-heat-help')}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <NumberPadField
                  label={t('cauterize-heat-hits-roll')}
                  value={heatHitsRoll}
                  onChange={setHeatHitsRoll}
                  integer
                  min={0}
                  disabled={busy}
                />
                <RollField
                  spec={D100}
                  label={t('cauterize-heat-critical-roll')}
                  value={heatCriticalRoll}
                  onChange={(value) => setHeatCriticalRoll(value.total)}
                  onClear={() => setHeatCriticalRoll(null)}
                  disabled={busy}
                />
              </Stack>
            </Stack>
          )}
          {!askRoll && (
            <Typography variant="body2" color="text.secondary">
              {t('medical-complete-help')}
            </Typography>
          )}
        </>
      )}
    </Stack>
  );

  const steps: FlowStep[] = [
    {
      id: 'declared',
      label: t(`procedure-${medical.procedure}`),
      summary: [
        patient?.actorName,
        targetText,
        t('rounds-short', { count: medical.rounds }),
        action.continuesActionId ? t('medical-continued') : null,
      ]
        .filter(Boolean)
        .join(' · '),
    },
    { id: 'resolve', label: t('medical-progress'), content: rolls },
    { id: 'result', label: t('result'), content: progressView },
  ];

  return (
    <ActionFlow
      action={action}
      steps={steps}
      activeIndex={done ? 2 : 1}
      primary={
        done
          ? undefined
          : { label: resolveLabel, disabled: busy || !progress.resolvable, onClick: resolve, resolves: true }
      }
      onDeleted={onDeleted}
      onNextPending={onNextPending}
    />
  );
};

/** A round of the action resolved: its result and total with the breakdown, and what it did. */
const MedicalStepView: FC<{ step: MedicalStepResult }> = ({ step }) => {
  const { t } = useTranslation();
  const modifiers = (step.breakdown ?? []).filter((each) => !NOT_ROLL_KEYS.includes(each.key)) as RollModifier[];
  const lines = [
    step.roundsGained ? t('stabilize-rounds-gained', { count: step.roundsGained }) : null,
    step.removed ? t('medical-dying-removed') : null,
    step.completed ? t('medical-step-completed') : null,
    step.heatCritical ? t('cauterize-heat-result', { severity: step.heatCritical, hits: step.heatHits ?? 0 }) : null,
  ];
  if (!step.result) {
    return (
      <Typography variant="body2" color="text.secondary">
        {[t('round-n', { round: step.round }), ...lines].filter(Boolean).join(' · ')}
      </Typography>
    );
  }
  return (
    <Box>
      <RollResultAlert
        severity={RESULT_SEVERITY[step.result] ?? 'info'}
        headline={`${t('round-n', { round: step.round })} · ${t(step.result)} · ${t('total')} ${step.total ?? ''}`}
        lines={lines}
        breakdown={<RollBreakdown context="medical" modifiers={modifiers} roll={step.roll} total={step.total} />}
      />
    </Box>
  );
};

export default MedicalFlow;
