import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Button, Stack } from '@mui/material';
import {
  formatBonus,
  HealerPicker,
  isLimbLost,
  NumberPadField,
  OPEN_D100,
  resolveHealer,
  RmuDialog,
  RollField,
  SectionLabel,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import {
  amputateActorRoundLimb,
  reviveActorRound,
  stabilizeActorRoundEffect,
  treatActorRoundInjury,
} from '../../api/actor-rounds';
import { ActorRound } from '../../api/actor-rounds.dto';
import { useCombatGame, useCombatRound, useCombatActions } from '../../combat/combat-context';
import { useBusyAction } from '../../hooks/useBusyAction';
import { useHealingTables } from '../../hooks/useCoreTables';
import MedicalDifficultyHint from './MedicalDifficultyHint';
import MedicalResultView from './MedicalResultView';
import { AmputationFields, CauterizeFields, ProcedureField, ReviveFields } from './MedicalRollFields';
import { healerCandidates } from './medical';
import {
  amputationRequest,
  initialHealer,
  medicalDifficultyPreview,
  MedicalResponse,
  medicalRollDto,
  medicalRollReady,
  MedicalTarget,
  reviveRequest,
  treatmentRequest,
} from './medical-roll-rules';
import { useMedicalRollForm } from './useMedicalRollForm';

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
  const { characters } = useCombatGame();
  const { actorRounds } = useCombatRound();
  const { updateActorRound } = useCombatActions();
  const healingTables = useHealingTables();
  const candidates = healerCandidates(actorRounds ?? [], characters ?? []);
  const selfCandidate = candidates.some((candidate) => candidate.id === actorRound.actorId);
  const { form, change } = useMedicalRollForm(target, () => initialHealer(candidates, actorRound.actorId));
  const { busy, run } = useBusyAction();
  const [result, setResult] = useState<MedicalResponse | null>(null);
  // A new target starts a new roll: the result of the previous one goes with it.
  useEffect(() => {
    if (target) setResult(null);
  }, [target]);

  if (!target) return null;

  const { roll, difficulty } = form;
  const resolved = resolveHealer(form.healer, candidates, actorRound.actorId);
  const preview = medicalDifficultyPreview(target, form, healingTables);
  const limbLost = target.kind === 'amputate' && isLimbLost(actorRound.lostLimbs, form.location, form.side);
  const valid = medicalRollReady(target, form, preview, !!resolved, limbLost);
  const cauterize = target.kind === 'treat' && form.procedure === 'cauterize';
  // Stabilizing needs no table; a treatment without core's tables leaves the difficulty to the API.
  const knownTables = target.kind !== 'treat' || !!healingTables;
  const fields = { form, busy, onChange: change };

  const submit = () => {
    if (!resolved || roll === null) return;
    const dto = medicalRollDto(target, form, resolved, roll);
    const call: Promise<MedicalResponse> =
      target.kind === 'amputate'
        ? amputateActorRoundLimb(actorRound.id, amputationRequest(dto, form, target.injury), auth)
        : target.kind === 'revive'
          ? reviveActorRound(actorRound.id, reviveRequest(dto, form), auth)
          : target.kind === 'treat'
            ? treatActorRoundInjury(actorRound.id, target.injury.id, treatmentRequest(dto, form), auth)
            : stabilizeActorRoundEffect(actorRound.id, target.effect.id, dto, auth);
    run(
      call.then((response) => {
        updateActorRound(response.actorRound);
        setResult(response);
      })
    );
  };

  const title = t(
    { treat: 'treat-injury', stabilize: 'stabilize-dying', amputate: 'amputation', revive: 'revive' }[target.kind]
  );
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
      onDismiss={onClose}
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
              {t({ treat: 'treat', stabilize: 'stabilize', amputate: 'amputate', revive: 'revive' }[target.kind])}
            </Button>
          </>
        )
      }
    >
      {result ? (
        <MedicalResultView result={result} target={target} />
      ) : (
        <Stack spacing={2}>
          <SectionLabel>{t('healer')}</SectionLabel>
          <HealerPicker
            characters={candidates}
            value={form.healer}
            onChange={(healer) => change({ healer })}
            selfId={selfCandidate ? actorRound.actorId : undefined}
            disabled={busy}
          />
          {target.kind === 'treat' && <ProcedureField {...fields} injury={target.injury} />}
          {target.kind === 'amputate' && <AmputationFields {...fields} injury={target.injury} limbLost={limbLost} />}
          {target.kind === 'revive' && <ReviveFields {...fields} soulRoundsLeft={actorRound.soulRoundsLeft ?? 0} />}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {target.kind !== 'revive' && (
              <NumberPadField
                steps={[-10, -5, 5, 10]}
                label={t('difficulty')}
                value={difficulty}
                onChange={(value) => change({ difficulty: value })}
                placeholder={preview.kind === 'value' && knownTables ? formatBonus(preview.value) : undefined}
                integer
                allowNegatives
                disabled={busy}
              />
            )}
            <RollField
              spec={OPEN_D100}
              value={roll}
              onChange={(value) => change({ roll: value.total, unmodified: value.unmodified })}
              disabled={busy}
            />
          </Stack>
          <MedicalDifficultyHint
            preview={preview}
            override={difficulty !== null && target.kind !== 'revive'}
            tables={knownTables}
          />
          {target.kind === 'amputate' && (
            <NumberPadField
              label={t('amputation-system-shock-roll')}
              value={form.systemShockRoll}
              onChange={(systemShockRoll) => change({ systemShockRoll })}
              integer
              min={2}
              max={20}
              disabled={busy}
            />
          )}
          {cauterize && <CauterizeFields {...fields} />}
        </Stack>
      )}
    </RmuDialog>
  );
};

export default MedicalRollDialog;
