import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Stack, Tab, Tabs } from '@mui/material';
import { FlowStep, useNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../../CombatContext';
import { applyAttack, declareParry, prepareAttack } from '../../../../api/action';
import { Action, ParryDeclaration } from '../../../../api/action.dto';
import { ActorRound } from '../../../../api/actor-rounds.dto';
import { attackActionPoints } from '../../../../services/action-service';
import AttackModifiersForm from '../../../action-dialogs/attack-modifiers/AttackModifiersForm';
import ResolveAttackFormRoll from '../../../action-dialogs/attack/ResolveAttackFormRoll';
import ActionFlow from '../../ActionFlow';
import { AttackResults } from '../ActionResults';
import AttackTargetsStep from './AttackTargetsStep';
import ParryStep from './ParryStep';
import { AttackKind, useAttackDeclaration } from './useAttackDeclaration';

/** Step of the flow for an action status: before prepare the step is local (targets or modifiers). */
const stepOf = (action: Action, kind: AttackKind, localStep: number) => {
  const parry = kind === 'melee';
  switch (action.status) {
    case 'declared':
      return localStep;
    case 'parry':
      return 2;
    case 'completed':
      return parry ? 4 : 3;
    default:
      return parry ? 3 : 2;
  }
};

/**
 * Melee or ranged attack in the side panel: targets (with OB, protectors or range) → modifiers (one tab per
 * weapon) → parry (melee) → rolls (attack, location, criticals, fumble) → result. The step follows the action
 * status from the API; before "Prepare" the user moves between targets and modifiers.
 */
const AttackFlow: FC<{
  kind: AttackKind;
  action: Action;
  actorRound: ActorRound;
  onDeleted: () => void;
  onNextPending?: () => void;
}> = ({ kind, action, actorRound, onDeleted, onNextPending }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useNotify();
  const { game, actorRounds, updateAction, refreshActorRounds } = useContext(CombatContext)!;
  const declaration = useAttackDeclaration(action, actorRound, kind);
  const { formData, setFormData, targeted } = declaration;
  const [localStep, setLocalStep] = useState(0);
  const [tab, setTab] = useState(0);
  const [busy, setBusy] = useState(false);
  const step = stepOf(action, kind, localStep);
  const withParry = kind === 'melee';
  const targetName = (targetId: string) => actorRounds?.find((ar) => ar.actorId === targetId)?.actorName ?? '';

  const call = (request: Promise<Action>, message: string, after?: () => void) => {
    setBusy(true);
    request
      .then((updated) => {
        updateAction(updated);
        notify.success(message);
        after?.();
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  const prepare = () => call(prepareAttack(action.id, { ...formData, attacks: targeted }, auth), t('attack-prepared'));
  const parry = () =>
    call(
      declareParry(
        action.id,
        { parries: (formData.parries ?? []).map((p) => ({ parryId: p.id, parry: p.parry })) } as ParryDeclaration,
        auth
      ),
      t('parry-declared')
    );
  const apply = () => call(applyAttack(action.id, auth), t('attack-applied'), refreshActorRounds);

  // Before prepare the action points come from the game phase (as in the API); without any, it cannot be prepared.
  const noActionPoints =
    action.status === 'declared' && !action.freeAction && !!game && attackActionPoints(action, game) <= 0;
  const targetsReady =
    targeted.length > 0 && (kind === 'melee' || targeted.every((a) => !!a.modifiers.range)) && !noActionPoints;
  const attacksShown = action.status === 'declared' ? targeted : formData.attacks;
  const shownTab = Math.min(tab, Math.max(0, attacksShown.length - 1));

  const modifiers =
    attacksShown.length > 0 ? (
      <Stack spacing={1.5}>
        {attacksShown.length > 1 && (
          <Tabs value={shownTab} onChange={(_, value: number) => setTab(value)}>
            {attacksShown.map((a) => (
              <Tab key={a.attackName} label={t(a.attackName)} />
            ))}
          </Tabs>
        )}
        <AttackModifiersForm
          formData={formData}
          setFormData={setFormData}
          index={formData.attacks.findIndex((a) => a.attackName === attacksShown[shownTab].attackName)}
          kind={kind}
          target={actorRounds?.find((ar) => ar.actorId === attacksShown[shownTab].modifiers.targetId)}
        />
      </Stack>
    ) : null;

  const rolls = (
    <Stack spacing={3}>
      {formData.attacks.map((attack, index) => (
        <ResolveAttackFormRoll
          key={attack.attackName}
          formData={formData}
          setFormData={setFormData}
          action={action}
          attack={attack}
          index={index}
        />
      ))}
    </Stack>
  );

  const result = <AttackResults attacks={formData.attacks} />;

  const steps: FlowStep[] = [
    {
      id: 'targets',
      label: kind === 'melee' ? t('targets') : t('targets-and-range'),
      summary: targeted.map((a) => `${t(a.attackName)} → ${targetName(a.modifiers.targetId)}`).join(' · '),
      content: (
        <AttackTargetsStep
          kind={kind}
          actorRound={actorRound}
          attacks={formData.attacks}
          onTarget={declaration.selectTarget}
          onBo={declaration.setBo}
          onRange={declaration.setRange}
          onProtector={declaration.toggleProtector}
        />
      ),
    },
    { id: 'modifiers', label: t('modifiers'), content: modifiers },
    ...(withParry
      ? [
          {
            id: 'parry',
            label: t('parry'),
            content: <ParryStep formData={formData} setFormData={setFormData} />,
          },
        ]
      : []),
    { id: 'rolls', label: t('rolls'), content: rolls },
    { id: 'result', label: t('result'), content: result },
  ];

  const rollsStep = withParry ? 3 : 2;
  let primary;
  if (step === 0)
    primary = {
      label: noActionPoints ? t('no-available-action-points') : t('next'),
      disabled: !targetsReady,
      onClick: () => setLocalStep(1),
    };
  else if (step === 1) primary = { label: t('prepare'), disabled: busy || targeted.length === 0, onClick: prepare };
  else if (withParry && step === 2) primary = { label: t('parry'), disabled: busy, onClick: parry };
  else if (step === rollsStep)
    primary = { label: t('apply'), disabled: busy || action.status !== 'pending_apply', onClick: apply };

  return (
    <ActionFlow
      action={action}
      steps={steps}
      activeIndex={step}
      primary={primary}
      back={
        step === 1 && action.status === 'declared' ? { label: t('back'), onClick: () => setLocalStep(0) } : undefined
      }
      onDeleted={onDeleted}
      onNextPending={onNextPending}
    />
  );
};

export default AttackFlow;
