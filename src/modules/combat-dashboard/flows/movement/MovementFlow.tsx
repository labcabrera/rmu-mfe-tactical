import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Stack } from '@mui/material';
import { FlowStep, OPEN_D100, RollField, SectionLabel, useApiNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import { resolveMovement } from '../../../api/action';
import { Action, ActionMovement } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import { useCombatGame, useCombatRound, useCombatActions } from '../../../combat/combat-context';
import { useActionConfirm, useNotifyWarnings } from '../../../hooks/useActionWarnings';
import { useBusyAction } from '../../../hooks/useBusyAction';
import { useSkillService } from '../../../hooks/useSkillService';
import { isActionClosed } from '../../../services/ap-service';
import { actorOpenEnded } from '../../../services/combat-talents-service';
import { phaseNumber } from '../../../services/phase-service';
import ActionFlow from '../ActionFlow';
import { MovementResult } from '../ActionResults';
import { rememberedLight } from '../maneuver/maneuver-form';
import { useSkillDifficultyGuide } from '../useSkillDifficultyGuide';
import { FreePace, NormalPace } from './MovementPace';
import { MovementManeuverDetails, MovementSetup } from './MovementSections';
import { initialMovementForm, movementPlan, movementSetupReady } from './movement-rules';

/**
 * Movement in the side panel: one step with the setup (skill, whether it needs a maneuver, difficulty) and the pace, the maneuver
 * roll when it needs one, and the result. Everything before "Resolve" is local; the API resolves it in one call.
 */
const MovementFlow: FC<{
  action: Action;
  actorRound: ActorRound;
  onDeleted: () => void;
  onNextPending?: () => void;
}> = ({ action, actorRound, onDeleted, onNextPending }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const { game, strategicGame } = useCombatGame();
  const { actorRounds, roundActions } = useCombatRound();
  const { updateAction, refreshActorRounds } = useCombatActions();
  const { getSkillBonus } = useSkillService();
  const confirm = useActionConfirm();
  const notifyWarnings = useNotifyWarnings();
  const [form, setForm] = useState<ActionMovement>(() =>
    // Workspace spec 076: the ambient light of the game first, else the last one chosen
    initialMovementForm(action, actorRound, game?.environment?.light ?? rememberedLight(action.gameId))
  );
  const [step, setStep] = useState(0);
  const { busy, run } = useBusyAction();
  // Completed, or ended without being resolved (interrupted, expired, carried to the next round).
  const done = isActionClosed(action);
  const { modifiers } = form;
  const setModifiers = (change: Partial<ActionMovement['modifiers']>) =>
    setForm((prev) => ({ ...prev, modifiers: { ...prev.modifiers, ...change } }));

  const scale = strategicGame?.options?.boardScaleMultiplier || 1;
  const skillBonus = (skillId: string) => getSkillBonus(skillId, actorRound);
  const guide = useSkillDifficultyGuide(modifiers.requiredManeuver ? modifiers.skillId : null);
  const plan = movementPlan({
    action,
    actorRound,
    actorRounds,
    roundActions,
    currentPhase: game ? phaseNumber(game.phase) : 0,
    modifiers,
    fatigueMultiplier: strategicGame?.options?.fatigueMultiplier,
  });

  const resolve = () => {
    // Workspace spec 068: exertion with a wound that reopens asks for a confirmation first
    run(
      confirm
        .run((confirmed) => {
          const body = { ...form, modifiers: { ...modifiers, pace: plan.pace } };
          return resolveMovement(action.id, confirmed ? { ...body, confirm: true } : body, auth);
        })
        .then((result: Action) => {
          updateAction(result);
          refreshActorRounds();
          notify.success(t('movement-resolved'));
          notifyWarnings(result.warnings);
        })
    );
  };

  const roll = (
    <RollField
      spec={OPEN_D100}
      label={t('maneuver-roll')}
      value={form.roll?.roll ?? null}
      onChange={(value) => setForm((prev) => ({ ...prev, roll: { ...prev.roll, roll: value.total } }))}
      openEnded={actorOpenEnded(actorRound)}
    />
  );

  const result = <MovementResult action={action} />;

  // Setup and pace in one step: the skill, whether it needs a maneuver, and how fast the actor goes.
  const steps: FlowStep[] = [
    {
      id: 'setup',
      label: t('movement'),
      summary: [
        t(modifiers.skillId),
        modifiers.requiredManeuver && modifiers.difficulty ? t(`difficulty-${modifiers.difficulty}`) : null,
        plan.pace ? t(plan.pace) : null,
      ]
        .filter(Boolean)
        .join(' · '),
      content: (
        <Stack spacing={2}>
          <MovementSetup
            actorRound={actorRound}
            modifiers={modifiers}
            grappleFeatNeeded={plan.grappleFeatNeeded}
            skillBonus={skillBonus}
            onChange={setModifiers}
          />
          <SectionLabel>{t('pace')}</SectionLabel>
          {modifiers.requiredManeuver && (
            <Alert severity="info" variant="outlined">
              {t('movement-distance-roll-note')}
            </Alert>
          )}
          {plan.freeMovement ? (
            <FreePace plan={plan} modifiers={modifiers} scale={scale} onChange={setModifiers} />
          ) : (
            <NormalPace plan={plan} modifiers={modifiers} scale={scale} onChange={setModifiers} />
          )}
          {modifiers.requiredManeuver && (
            <MovementManeuverDetails
              gameId={action.gameId}
              baseDifficulty={actorRound.movement.baseDifficulty}
              modifiers={modifiers}
              guide={guide}
              onChange={setModifiers}
            />
          )}
        </Stack>
      ),
    },
    ...(modifiers.requiredManeuver
      ? [{ id: 'roll', label: t('roll'), summary: form.roll?.roll ?? undefined, content: roll }]
      : []),
    { id: 'result', label: t('result'), content: result },
  ];
  const resultIndex = steps.length - 1;
  const current = done ? resultIndex : Math.min(step, resultIndex - 1);
  const onLastInput = current === resultIndex - 1;
  const canContinue =
    (steps[current].id === 'setup' && movementSetupReady(plan, modifiers)) ||
    (steps[current].id === 'roll' && form.roll?.roll !== null && form.roll?.roll !== undefined);

  return (
    <>
      <ActionFlow
        action={action}
        steps={steps}
        activeIndex={current}
        primary={
          done
            ? undefined
            : {
                label: onLastInput ? t('resolve') : t('next'),
                disabled: !canContinue || busy,
                onClick: () => (onLastInput ? resolve() : setStep(current + 1)),
                resolves: onLastInput,
              }
        }
        back={current > 0 ? { label: t('back'), onClick: () => setStep(current - 1) } : undefined}
        onDeleted={onDeleted}
        onNextPending={onNextPending}
      />
      {confirm.dialog}
    </>
  );
};

export default MovementFlow;
