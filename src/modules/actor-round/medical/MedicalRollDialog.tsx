import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import {
  D100,
  formatBonus,
  HealerPicker,
  HealerSelection,
  Injury,
  NumericInput,
  OPEN_D100,
  resolveHealer,
  RmuDialog,
  RollBreakdown,
  RollField,
  RollModifier,
  RuleHint,
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
import { useHealingTables } from '../../services/core-tables';
import { useTacticalNotify } from '../../services/notify-service';
import {
  DEFAULT_STABILIZE_DIFFICULTY,
  DifficultyPreview,
  healerCandidates,
  isProcedureAvailable,
  previewTreatmentDifficulty,
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
 * difficulty (by default the API takes it from core's treatment table, spec 022 D4, and the dialog previews it) and
 * the open-ended roll; a cauterization may take the dice of its extra hits and heat critical (Table 13-1c). The API
 * resolves it with the medical maneuver table and the dialog shows the result: the bleeding and penalty change, the
 * heat critical and hits of a cauterization, or the rounds a dying actor gains.
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
  const [unmodified, setUnmodified] = useState<number | null>(null);
  const [heatHitsRoll, setHeatHitsRoll] = useState<number | null>(null);
  const [heatCriticalRoll, setHeatCriticalRoll] = useState<number | null>(null);
  const healingTables = useHealingTables();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<MedicalResultDto | null>(null);

  // A new target starts a new roll.
  useEffect(() => {
    if (!target) return;
    setHealer(initialHealer());
    setProcedure(target.kind === 'treat' && (target.injury.bleeding ?? 0) === 0 ? 'dress' : 'pressure');
    setDifficulty(null);
    setRoll(null);
    setUnmodified(null);
    setHeatHitsRoll(null);
    setHeatCriticalRoll(null);
    setResult(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  if (!target) return null;

  const resolved = resolveHealer(healer, candidates, actorRound.actorId);
  const preview: DifficultyPreview =
    target.kind === 'treat'
      ? previewTreatmentDifficulty(procedure, target.injury, healingTables)
      : { kind: 'value', value: DEFAULT_STABILIZE_DIFFICULTY, source: 'legacy', head: false, bleeding: 0 };
  // Without a row of the table the API rejects the treatment unless the game master sets the difficulty.
  const needsDifficulty = preview.kind !== 'value' && difficulty === null;
  const valid = !!resolved && roll !== null && Number.isFinite(roll) && !needsDifficulty;
  const cauterize = target.kind === 'treat' && procedure === 'cauterize';
  // Stabilizing needs no table; a treatment without core's tables leaves the difficulty to the API.
  const knownTables = target.kind === 'stabilize' || !!healingTables;

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
        ? treatActorRoundInjury(
            actorRound.id,
            target.injury.id,
            {
              ...dto,
              procedure,
              ...(unmodified !== null && unmodified !== roll ? { unmodifiedRoll: unmodified } : {}),
              ...(cauterize && heatHitsRoll !== null ? { heatHitsRoll } : {}),
              ...(cauterize && heatCriticalRoll !== null ? { heatCriticalRoll } : {}),
            },
            auth
          )
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
      ? [
          actorRound.actorName,
          t(`injury-type-${target.injury.type}`),
          target.injury.location && t(target.injury.location),
        ]
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
              placeholder={preview.kind === 'value' && knownTables ? formatBonus(preview.value) : undefined}
              integer
              allowNegatives
              disabled={busy}
            />
            <RollField
              spec={OPEN_D100}
              value={roll}
              onChange={(value) => {
                setRoll(value.total);
                setUnmodified(value.unmodified);
              }}
              disabled={busy}
            />
          </Stack>
          <DifficultyHint preview={preview} override={difficulty !== null} tables={knownTables} />
          {cauterize && (
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary">
                {t('cauterize-heat-help')}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <NumericInput
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
        </Stack>
      )}
    </RmuDialog>
  );
};

/** Where the difficulty comes from when the game master sets none, or why there is none. */
const DifficultyHint: FC<{ preview: DifficultyPreview; override: boolean; tables: boolean }> = ({
  preview,
  override,
  tables,
}) => {
  const { t } = useTranslation();
  if (override) {
    return (
      <Typography variant="caption" color="text.secondary">
        {t('treatment-difficulty-override')}
      </Typography>
    );
  }
  if (preview.kind !== 'value') {
    return (
      <Alert severity="warning">
        {t(preview.kind === 'type-required' ? 'err-injury-type-required-treatment' : 'err-treatment-not-applicable')}
      </Alert>
    );
  }
  if (!tables) {
    return (
      <Typography variant="caption" color="text.secondary">
        {t('treatment-difficulty-unavailable')}
      </Typography>
    );
  }
  const lines = [
    preview.source === 'table' ? t('treatment-difficulty-table') : null,
    preview.head ? t('treatment-head-harder') : null,
    preview.bleeding ? t('treatment-cauterize-extra', { value: formatBonus(preview.bleeding) }) : null,
  ].filter(Boolean);
  return (
    <Typography variant="caption" color="text.secondary" component="div">
      {`${t('difficulty')} ${formatBonus(preview.value)} · ${lines.join(' ')}`}
    </Typography>
  );
};

/** The result of the roll: its total and breakdown, and what it did to the injury or the dying effect. */
const MedicalResultView: FC<{ result: MedicalResultDto; target: MedicalTarget }> = ({ result, target }) => {
  const { t } = useTranslation();
  const after =
    target.kind === 'treat' ? result.actorRound.injuries?.find((injury) => injury.id === target.injury.id) : undefined;
  const bleedingBefore = target.kind === 'treat' ? Math.max(0, target.injury.bleeding ?? 0) : 0;
  const bleedingAfter = Math.max(0, after?.bleeding ?? 0);
  // Spec 052: the API's breakdown, or the same entries from the numbers of an older API
  const breakdown: RollModifier[] = (
    result.breakdown ?? [
      { key: 'medicine', value: result.bonus, group: 'skill' },
      { key: 'difficulty', value: result.difficulty, group: 'situation' },
      { key: 'healer-penalty', value: result.healerPenalty, group: 'penalty' },
    ]
  ).filter((modifier) => modifier.key !== 'roll' && (modifier.key !== 'healer-penalty' || modifier.value !== 0));

  return (
    <Stack spacing={1.5}>
      <Alert severity={RESULT_SEVERITY[result.result]}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {`${t(result.result)} · ${t('total')} ${result.total}`}
        </Typography>
        {result.message && (
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {result.message}
          </Typography>
        )}
      </Alert>
      <RuleHint
        title={t(result.result)}
        description={t(`medical-result-${result.result}-explanation`)}
        reference={target.kind === 'treat' ? '§13.1' : '§13.2'}
      >
        <Typography variant="body2" color="text.secondary">
          {t('medical-result-why')}
        </Typography>
      </RuleHint>
      <RollBreakdown context="medical" modifiers={breakdown} roll={result.roll} total={result.total} />
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
      {result.heat ? (
        <Alert severity="warning">
          <Typography variant="body2">
            {t('cauterize-heat-result', { severity: result.heat.critical, hits: result.heat.hits })}
          </Typography>
          {result.heat.criticalRoll !== undefined ? (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {t('cauterize-heat-critical-resolved', {
                roll: result.heat.criticalRoll,
                hits: result.heat.criticalDamage ?? 0,
              })}
              {result.heat.criticalText ? ` ${result.heat.criticalText}` : ''}
            </Typography>
          ) : (
            result.heat.alertId && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {t('cauterize-heat-critical-alert')}
              </Typography>
            )
          )}
        </Alert>
      ) : (
        result.heatCritical && (
          <Alert severity="warning">{t('cauterize-heat-critical', { severity: result.heatCritical })}</Alert>
        )
      )}
      {result.unusualEvent && <Alert severity="error">{t('cauterize-unusual-event')}</Alert>}
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
