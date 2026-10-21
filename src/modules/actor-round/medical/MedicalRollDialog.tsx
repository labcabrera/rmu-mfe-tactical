import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import {
  formatBonus,
  HealerPicker,
  HealerSelection,
  Injury,
  NumericInput,
  resolveHealer,
  RmuDialog,
  RollInput,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { stabilizeActorRoundEffect, treatActorRoundInjury } from '../../api/actor-rounds';
import {
  ActorRound,
  ActorRoundEffect,
  MedicalResultDto,
  MedicalRollDto,
  TACTICAL_PROCEDURES,
  TacticalProcedure,
} from '../../api/actor-rounds.dto';
import { useTacticalNotify } from '../../services/notify-service';
import {
  DEFAULT_STABILIZE_DIFFICULTY,
  defaultTreatmentDifficulty,
  healerCandidates,
  isProcedureAvailable,
} from './medical';

/** What the medical roll is for: treating an injury, or stabilizing a dying actor. */
export type MedicalTarget = { kind: 'treat'; injury: Injury } | { kind: 'stabilize'; effect: ActorRoundEffect };

const RESULT_SEVERITY: Record<MedicalResultDto['result'], 'error' | 'warning' | 'info' | 'success'> = {
  'absolute-failure': 'error',
  failure: 'warning',
  'partial-success': 'info',
  success: 'success',
  'absolute-success': 'success',
};

/**
 * Medical roll of the tactical game (spec 013, §3): the healer (an actor of the round, the patient itself included,
 * or an external healer with a name and a Medicine bonus), the procedure (when treating an injury), an optional
 * difficulty (the API applies the one of the procedure otherwise) and the open-ended roll. The API resolves it with
 * the medical maneuver table and the dialog shows the result: the bleeding and penalty change, the heat critical to
 * resolve after cauterizing, or the rounds a dying actor gains.
 */
const MedicalRollDialog: FC<{
  actorRound: ActorRound;
  target: MedicalTarget | null;
  onClose: () => void;
}> = ({ actorRound, target, onClose }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const { actorRounds, characters, updateActorRound } = useContext(CombatContext)!;
  const candidates = healerCandidates(actorRounds ?? [], characters ?? []);
  const selfCandidate = candidates.some((candidate) => candidate.id === actorRound.actorId);
  const initialHealer = (): HealerSelection => {
    const other = candidates.find((candidate) => candidate.id !== actorRound.actorId);
    if (other) return { mode: 'character', characterId: other.id };
    return selfCandidate ? { mode: 'self' } : { mode: 'external', name: '', medicine: 0 };
  };
  const [healer, setHealer] = useState<HealerSelection>(initialHealer);
  const [procedure, setProcedure] = useState<TacticalProcedure>('pressure');
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [roll, setRoll] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<MedicalResultDto | null>(null);

  // A new target starts a new roll.
  useEffect(() => {
    if (!target) return;
    setHealer(initialHealer());
    setProcedure(target.kind === 'treat' && (target.injury.bleeding ?? 0) === 0 ? 'dress' : 'pressure');
    setDifficulty(null);
    setRoll(null);
    setResult(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  if (!target) return null;

  const resolved = resolveHealer(healer, candidates, actorRound.actorId);
  const defaultDifficulty =
    target.kind === 'treat' ? defaultTreatmentDifficulty(procedure, target.injury) : DEFAULT_STABILIZE_DIFFICULTY;
  const valid = !!resolved && roll !== null && Number.isFinite(roll);

  const submit = () => {
    if (!resolved || roll === null) return;
    const dto: MedicalRollDto = {
      ...(resolved.external
        ? { healer: { name: resolved.name, bonus: resolved.medicine } }
        : { healerActorId: resolved.characterId }),
      roll,
      ...(difficulty !== null ? { difficulty } : {}),
    };
    setBusy(true);
    const call =
      target.kind === 'treat'
        ? treatActorRoundInjury(actorRound.id, target.injury.id, { ...dto, procedure }, auth)
        : stabilizeActorRoundEffect(actorRound.id, target.effect.id, dto, auth);
    call
      .then((response) => {
        updateActorRound(response.actorRound);
        setResult(response);
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  const title = target.kind === 'treat' ? t('treat-injury') : t('stabilize-dying');
  const subtitle =
    target.kind === 'treat'
      ? [actorRound.actorName, t(`injury-type-${target.injury.type}`), target.injury.location && t(target.injury.location)]
          .filter(Boolean)
          .join(' · ')
      : actorRound.actorName;

  return (
    <RmuDialog
      open={!!target}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      maxWidth="sm"
      buttons={
        result ? (
          <Button variant="contained" onClick={onClose}>
            {t('close')}
          </Button>
        ) : (
          <>
            <Button onClick={onClose} disabled={busy}>
              {t('cancel')}
            </Button>
            <Button variant="contained" onClick={submit} disabled={!valid || busy}>
              {target.kind === 'treat' ? t('treat') : t('stabilize')}
            </Button>
          </>
        )
      }
    >
      {result ? (
        <MedicalResultView result={result} target={target} />
      ) : (
        <Stack spacing={2}>
          <Typography variant="subtitle2">{t('healer')}</Typography>
          <HealerPicker
            characters={candidates}
            value={healer}
            onChange={setHealer}
            selfId={selfCandidate ? actorRound.actorId : undefined}
            disabled={busy}
          />
          {target.kind === 'treat' && (
            <TextField
              select
              label={t('treatment-procedure')}
              value={procedure}
              onChange={(event) => setProcedure(event.target.value as TacticalProcedure)}
              disabled={busy}
              fullWidth
            >
              {TACTICAL_PROCEDURES.map((value) => (
                <MenuItem key={value} value={value} disabled={!isProcedureAvailable(value, target.injury)}>
                  {t(`procedure-${value}`)}
                </MenuItem>
              ))}
            </TextField>
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <NumericInput
              label={t('difficulty')}
              value={difficulty}
              onChange={setDifficulty}
              placeholder={formatBonus(defaultDifficulty)}
              integer
              allowNegatives
              disabled={busy}
            />
            <RollInput value={roll} onChange={(value) => setRoll(value)} openEnded disabled={busy} />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {t('medical-default-difficulty', { value: formatBonus(defaultDifficulty) })}
          </Typography>
        </Stack>
      )}
    </RmuDialog>
  );
};

/** The result of the roll: its total and breakdown, and what it did to the injury or the dying effect. */
const MedicalResultView: FC<{ result: MedicalResultDto; target: MedicalTarget }> = ({ result, target }) => {
  const { t } = useTranslation();
  const after =
    target.kind === 'treat' ? result.actorRound.injuries?.find((injury) => injury.id === target.injury.id) : undefined;
  const bleedingBefore = target.kind === 'treat' ? Math.max(0, target.injury.bleeding ?? 0) : 0;
  const bleedingAfter = Math.max(0, after?.bleeding ?? 0);
  const breakdown = [
    `${t('roll')} ${result.roll}`,
    `${t('medicine')} ${formatBonus(result.bonus)}`,
    `${t('difficulty')} ${formatBonus(result.difficulty)}`,
    result.healerPenalty ? `${t('penalty')} ${formatBonus(result.healerPenalty)}` : undefined,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Stack spacing={1.5}>
      <Alert severity={RESULT_SEVERITY[result.result]}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {`${t(result.result)} · ${t('total')} ${result.total}`}
        </Typography>
        <Typography variant="caption" component="div">
          {breakdown}
        </Typography>
        {result.message && (
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {result.message}
          </Typography>
        )}
      </Alert>
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
      {result.heatCritical && (
        <Alert severity="warning">{t('cauterize-heat-critical', { severity: result.heatCritical })}</Alert>
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

export default MedicalRollDialog;
