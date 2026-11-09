import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Box, Chip, Stack, Typography } from '@mui/material';
import {
  ChipRow,
  FlowStep,
  formatBonus,
  GRAPPLE_ESCAPE_PURPOSE,
  GrappleEscapeRow,
  NumberPadField,
  OPEN_D100,
  RollBreakdown,
  RollField,
  RuleHint,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { resolveManeuver } from '../../../api/action';
import { Action } from '../../../api/action.dto';
import { ActorRound, ActorRoundEffect } from '../../../api/actor-rounds.dto';
import { useCombatRound, useCombatActions } from '../../../combat/combat-context';
import { useBusyAction } from '../../../hooks/useBusyAction';
import { useSkillService } from '../../../hooks/useSkillService';
import { actorRoundGrapples } from '../../../services/actor-round-service';
import { isActionClosed } from '../../../services/ap-service';
import { actorOpenEnded } from '../../../services/combat-talents-service';
import DifficultySelect from '../../../shared/selects/DifficultySelect';
import ActionFlow from '../ActionFlow';

/** Skills a grapple escape rolls (rmu-api-tactical `GRAPPLE_ESCAPE_SKILLS`): Wrestling or Contortions. */
export const GRAPPLE_ESCAPE_SKILLS = ['unarmed-st', 'unarmed-ag', 'contortions'];

/** AP of a grapple escape: a percent maneuver of 2 to 4 AP. */
export const GRAPPLE_ESCAPE_AP = { min: 2, max: 4 };

/** A net, a vine or a rope: no grappler resists, so no grappler's total. */
export const isObjectGrapple = (grapple: ActorRoundEffect): boolean => !!grapple.data?.object || !grapple.targetActorId;

/** A grapple an absolute failure of Contortions tightened: no escape without help. */
const isTightened = (grapple: ActorRoundEffect): boolean => !!grapple.data?.tightened;

type EscapeInput = { roll: number | null; difficulty: string; passiveTotal: number | null };

const emptyInput = (): EscapeInput => ({ roll: null, difficulty: 'm', passiveTotal: null });

/**
 * "Break free" (workspace spec 077, decision A3.3): a percent maneuver of Wrestling or Contortions, one roll against
 * each grapple of the actor in the same action, with its whole grapple penalty. Against a grappler it is contested (100
 * less the grappler's total); against an object it is not. Each result takes its percent off the grapple, which goes
 * at 0. The grapples without a roll are left as they are.
 */
const GrappleEscapeFlow: FC<{
  action: Action;
  actorRound: ActorRound;
  onDeleted: () => void;
  onNextPending?: () => void;
}> = ({ action, actorRound, onDeleted, onNextPending }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const { actorRounds } = useCombatRound();
  const { updateAction, refreshActorRounds } = useCombatActions();
  const { getSkillBonus } = useSkillService();
  const done = isActionClosed(action);
  const declaredSkill = action.maneuver?.modifiers.skillId ?? GRAPPLE_ESCAPE_SKILLS[0];
  const [skillId, setSkillId] = useState(
    GRAPPLE_ESCAPE_SKILLS.includes(declaredSkill) ? declaredSkill : GRAPPLE_ESCAPE_SKILLS[0]
  );
  const [inputs, setInputs] = useState<Record<string, EscapeInput>>({});
  const [step, setStep] = useState(1);
  const { busy, run } = useBusyAction();
  const grapples = actorRoundGrapples(actorRound);
  const actorName = (id: string | undefined) => actorRounds?.find((each) => each.actorId === id)?.actorName ?? '';
  const grappleName = (grapple: ActorRoundEffect) =>
    isObjectGrapple(grapple)
      ? t('effect-grappled-object')
      : t('effect-grappled-by', { name: actorName(grapple.targetActorId) });
  const inputOf = (effectId: string) => inputs[effectId] ?? emptyInput();
  const setInput = (effectId: string, patch: Partial<EscapeInput>) =>
    setInputs((prev) => ({ ...prev, [effectId]: { ...(prev[effectId] ?? emptyInput()), ...patch } }));

  const rows: GrappleEscapeRow[] = grapples
    .filter((grapple) => !isTightened(grapple) && inputOf(grapple.id).roll !== null)
    .map((grapple) => {
      const input = inputOf(grapple.id);
      return {
        effectId: grapple.id,
        roll: input.roll!,
        difficulty: input.difficulty,
        ...(!isObjectGrapple(grapple) && input.passiveTotal !== null ? { passiveTotal: input.passiveTotal } : {}),
      };
    });
  const ready =
    rows.length > 0 &&
    rows.every((row) => {
      const grapple = grapples.find((each) => each.id === row.effectId)!;
      return isObjectGrapple(grapple) || row.passiveTotal !== undefined;
    });

  const resolve = () => {
    run(
      resolveManeuver(
        action.id,
        { skillId, maneuverType: 'percent', purpose: GRAPPLE_ESCAPE_PURPOSE, grappleEscape: rows },
        auth
      ).then((result) => {
        updateAction(result);
        // The grapples changed (less percent, released or tightened)
        refreshActorRounds();
        notify.success(t('maneuver-resolved'));
      })
    );
  };

  const bonus = (id: string) => getSkillBonus(id, actorRound);
  const skillContent = (
    <Stack spacing={1.5}>
      <RuleHint title={t('grapple-escape')} description={t('grapple-escape-help')} reference="§9.8">
        <Typography variant="body2" color="text.secondary">
          {t('grapple-escape-help')}
        </Typography>
      </RuleHint>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }} role="radiogroup" aria-label={t('skill')}>
        {GRAPPLE_ESCAPE_SKILLS.map((id) => (
          <Chip
            key={id}
            role="radio"
            aria-checked={skillId === id}
            color={skillId === id ? 'primary' : 'default'}
            label={`${t(id)} ${bonus(id) === undefined ? '' : formatBonus(bonus(id)!)}`.trim()}
            onClick={() => !done && setSkillId(id)}
          />
        ))}
      </Box>
    </Stack>
  );

  const rollsContent = (
    <Stack spacing={2}>
      {grapples.length === 0 && <Alert severity="info">{t('err-grapple-not-grappled')}</Alert>}
      {grapples.map((grapple) => {
        const input = inputOf(grapple.id);
        const object = isObjectGrapple(grapple);
        return (
          <Box key={grapple.id} sx={{ borderLeft: 3, borderColor: 'divider', pl: 1.5 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, minWidth: 0 }} noWrap>
                {grappleName(grapple)}
              </Typography>
              <Chip size="small" color="warning" label={`${grapple.value ?? 0} %`} />
            </Stack>
            {isTightened(grapple) ? (
              <Typography variant="caption" color="error">
                {t('effect-grappled-tightened')}
              </Typography>
            ) : (
              <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 1, alignItems: 'flex-start' }}>
                <Box sx={{ minWidth: 200, flex: 1 }}>
                  <RollField
                    spec={OPEN_D100}
                    label={t('maneuver-roll')}
                    value={input.roll}
                    onChange={(roll) => setInput(grapple.id, { roll: roll.total })}
                    onClear={() => setInput(grapple.id, { roll: null })}
                    openEnded={actorOpenEnded(actorRound)}
                  />
                </Box>
                <DifficultySelect
                  value={input.difficulty}
                  onChange={(difficulty) => setInput(grapple.id, { difficulty })}
                />
                {!object && (
                  <Box sx={{ width: 160 }}>
                    <NumberPadField
                      label={t('grapple-escape-passive-total')}
                      value={input.passiveTotal}
                      onChange={(passiveTotal) => setInput(grapple.id, { passiveTotal })}
                      integer
                    />
                  </Box>
                )}
              </Stack>
            )}
          </Box>
        );
      })}
    </Stack>
  );

  const results = action.maneuver?.result?.grappleEscape ?? [];
  const resultContent = (
    <Stack spacing={2}>
      {action.maneuver?.result?.message && <Typography variant="body2">{action.maneuver.result.message}</Typography>}
      {results.map((result) => (
        <Stack key={result.effectId} spacing={1}>
          <ChipRow>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {result.grapplerId
                ? t('effect-grappled-by', { name: actorName(result.grapplerId) })
                : t('effect-grappled-object')}
            </Typography>
            <Chip size="small" color={result.percent > 0 ? 'primary' : 'error'} label={`${result.percent} %`} />
            {result.released ? (
              <Chip size="small" color="success" label={t('grapple-escape-released')} />
            ) : (
              <Chip
                size="small"
                variant="outlined"
                label={t('grapple-escape-remaining', { remaining: result.remaining })}
              />
            )}
            {result.tightened && <Chip size="small" color="error" label={t('grapple-escape-tightened')} />}
            {result.critical && (
              <Chip size="small" color="error" variant="outlined" label={`${t('critical')} ${result.critical}`} />
            )}
          </ChipRow>
          {result.message && (
            <Typography variant="caption" color="text.secondary">
              {result.message}
            </Typography>
          )}
          <RollBreakdown context="maneuver" modifiers={result.modifiers} roll={result.roll} total={result.total} />
        </Stack>
      ))}
    </Stack>
  );

  const steps: FlowStep[] = [
    {
      id: 'skill',
      label: t('grapple-escape'),
      summary: `${t(skillId)} · ${t('maneuver-purpose-grapple-escape')}`,
      content: skillContent,
    },
    {
      id: 'rolls',
      label: t('rolls'),
      summary: rows.map((row) => row.roll).join(' · ') || undefined,
      content: rollsContent,
    },
    { id: 'result', label: t('result'), content: resultContent, reviewInteractive: true },
  ];
  const current = done ? 2 : step;

  return (
    <ActionFlow
      action={action}
      steps={steps}
      activeIndex={current}
      primary={
        done
          ? undefined
          : current === 0
            ? { label: t('next'), onClick: () => setStep(1) }
            : { label: t('resolve'), disabled: !ready || busy, onClick: resolve, resolves: true }
      }
      back={!done && current === 1 ? { label: t('grapple-escape'), onClick: () => setStep(0) } : undefined}
      onDeleted={onDeleted}
      onNextPending={onNextPending}
    />
  );
};

export default GrappleEscapeFlow;
