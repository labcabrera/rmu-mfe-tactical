import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Stack, Tab, Tabs } from '@mui/material';
import { FlowStep, formatBonus } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../../CombatContext';
import { applyAttack, declareParry, prepareAttack } from '../../../../api/action';
import { Action, ParryDeclaration } from '../../../../api/action.dto';
import { ActorRound, ActorRoundAttack } from '../../../../api/actor-rounds.dto';
import { useNotifyWarnings } from '../../../../services/action-warnings';
import { actorRoundHasEffect } from '../../../../services/actor-round-service';
import { useTacticalNotify } from '../../../../services/notify-service';
import AttackModifiersForm from '../../../action-dialogs/attack-modifiers/AttackModifiersForm';
import StyleCriticalOptionPicker from '../../../action-dialogs/attack-modifiers/StyleCriticalOptionPicker';
import ResolveAttackFormRoll from '../../../action-dialogs/attack/ResolveAttackFormRoll';
import ActionFlow from '../../ActionFlow';
import { AttackResults } from '../ActionResults';
import AttackTargetsStep from './AttackTargetsStep';
import BoltSplitFields, { boltSplitValid } from './BoltSplitFields';
import ParryStep from './ParryStep';
import { ShieldManeuverInput, shieldManeuverAttacks, shieldManeuverItems } from './ShieldManeuverSection';
import { attackLabel } from './attack-label';
import { AttackKind, useAttackDeclaration } from './useAttackDeclaration';

/**
 * Step of the flow for an action status: before prepare the step is local (targets or modifiers). A spell cast has
 * its own statuses: its attack is local until the attacks are prepared.
 */
const stepOf = (action: Action, parry: boolean, localStep: number) => {
  if (action.actionType === 'cast_spell' && !action.attacks?.length) return localStep;
  switch (action.status) {
    case 'declared':
    case 'held':
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
 * weapon) → parry (melee) → rolls (attack, criticals, fumble) → result. The step follows the action
 * status from the API; before "Prepare" the user moves between targets and modifiers.
 *
 * An attack spell (spec 030, phase 4) uses the same flow: `sourceAttacks` holds the spell's attack instead of the
 * actor's weapons, `leadingSteps` the steps of the cast already done, and `onApplied` reads the caster again.
 */
const AttackFlow: FC<{
  kind: AttackKind;
  action: Action;
  actorRound: ActorRound;
  onDeleted: () => void;
  onNextPending?: () => void;
  sourceAttacks?: ActorRoundAttack[];
  leadingSteps?: FlowStep[];
  onApplied?: () => void;
  /** OB of a bolt that strikes several targets (workspace spec 077, Scope Skills): it is split among them. */
  boltOb?: number;
}> = ({ kind, action, actorRound, onDeleted, onNextPending, sourceAttacks, leadingSteps = [], onApplied, boltOb }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const notifyWarnings = useNotifyWarnings();
  const { actorRounds, updateAction, refreshActorRounds } = useContext(CombatContext)!;
  const declaration = useAttackDeclaration(action, actorRound, kind, sourceAttacks);
  const labelOf = (attackName: string) => attackLabel(attackName, t);
  const weapons = sourceAttacks ?? actorRound.attacks;
  const { formData, setFormData, targeted } = declaration;
  const [localStep, setLocalStep] = useState(0);
  const [tab, setTab] = useState(0);
  const [busy, setBusy] = useState(false);
  // Workspace spec 077: the Shield maneuvers typed in the parry step, and the OB split of a bolt
  const [shieldInputs, setShieldInputs] = useState<Record<string, ShieldManeuverInput>>({});
  const [obSplit, setObSplit] = useState<number[] | null>(null);
  // Melee attacks always go through the parry step; a ranged one only for the Shield maneuvers of its defenders.
  const shieldStep = shieldManeuverAttacks(formData.attacks).length > 0;
  const withParry = kind === 'melee' || shieldStep;
  const step = stepOf(action, withParry, localStep);
  const targetName = (targetId: string) => actorRounds?.find((ar) => ar.actorId === targetId)?.actorName ?? '';

  const call = (request: Promise<Action>, message: string, after?: () => void) => {
    setBusy(true);
    request
      .then((updated) => {
        updateAction(updated);
        notify.success(message);
        // Workspace spec 068: a balking attacker that charges, an attack with a useless arm
        notifyWarnings(updated.warnings);
        after?.();
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  const splitting = boltOb !== undefined && targeted.length > 1 && obSplit !== null;
  const splitParts = targeted.map((_, index) => obSplit?.[index] ?? 0);
  const prepare = () =>
    call(
      prepareAttack(action.id, { ...formData, attacks: targeted, ...(splitting ? { obSplit: splitParts } : {}) }, auth),
      t('attack-prepared')
    );
  const parry = () => {
    const shieldManeuvers = shieldManeuverItems(formData.attacks, shieldInputs);
    const parries = (formData.parries ?? []).map((p) => ({ parryId: p.id, parry: p.parry }));
    const body: ParryDeclaration = {
      ...(parries.length > 0 || shieldManeuvers.length === 0 ? { parries } : {}),
      ...(shieldManeuvers.length > 0 ? { shieldManeuvers } : {}),
    };
    call(declareParry(action.id, body, auth), t('parry-declared'), () => setShieldInputs({}));
  };
  const apply = () =>
    call(applyAttack(action.id, auth), t('attack-applied'), () => {
      refreshActorRounds();
      onApplied?.();
    });
  const unprepared =
    action.status === 'declared' ||
    action.status === 'held' ||
    (action.actionType === 'cast_spell' && !action.attacks?.length);

  // Targets and modifiers can be chosen at any time; "Prepare" fixes the AP of the attack, so it waits for the
  // minimum AP of its profile (readiness from the API), unless the attack is forced.
  const targetsReady = targeted.length > 0 && (kind === 'melee' || targeted.every((a) => !!a.modifiers.range));
  const attacksShown = unprepared ? targeted : formData.attacks;
  const shownTab = Math.min(tab, Math.max(0, attacksShown.length - 1));
  // Workspace spec 068, decision 14: a retreating attacker cannot charge, a balking one is warned
  const chargeFear = withParry
    ? actorRoundHasEffect(actorRound, ['fear-retreat'])
      ? 'fear-retreat'
      : actorRoundHasEffect(actorRound, ['fear-balk'])
        ? 'fear-balk'
        : undefined
    : undefined;

  const modifiers =
    attacksShown.length > 0 ? (
      <Stack spacing={1.5}>
        {attacksShown.length > 1 && (
          <Tabs value={shownTab} onChange={(_, value: number) => setTab(value)}>
            {attacksShown.map((a) => (
              <Tab key={a.attackName} label={labelOf(a.attackName)} />
            ))}
          </Tabs>
        )}
        {action.reaction && unprepared && (
          <Alert severity="info" variant="outlined">
            {action.reaction.obOverride === null || action.reaction.obOverride === undefined
              ? t('reaction-attack-help', { trait: t(action.reaction.traitId) })
              : t('reaction-attack-help-ob', {
                  trait: t(action.reaction.traitId),
                  ob: formatBonus(action.reaction.obOverride),
                })}
          </Alert>
        )}
        {chargeFear && unprepared && (
          <Alert severity={chargeFear === 'fear-retreat' ? 'warning' : 'info'} variant="outlined">
            {t(`fear-charge-${chargeFear}`)}
          </Alert>
        )}
        <AttackModifiersForm
          formData={formData}
          setFormData={setFormData}
          index={formData.attacks.findIndex((a) => a.attackName === attacksShown[shownTab].attackName)}
          kind={kind}
          target={actorRounds?.find((ar) => ar.actorId === attacksShown[shownTab].modifiers.targetId)}
        />
        {unprepared && (
          <StyleCriticalOptionPicker
            actorRound={actorRound}
            formData={formData}
            setFormData={setFormData}
            attackName={attacksShown[shownTab].attackName}
          />
        )}
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

  const result = <AttackResults attacks={formData.attacks} sourceActorId={action.actorId} />;

  const steps: FlowStep[] = [
    {
      id: 'targets',
      label: kind === 'melee' ? t('targets') : t('targets-and-range'),
      summary: targeted.map((a) => `${labelOf(a.attackName)} → ${targetName(a.modifiers.targetId)}`).join(' · '),
      content: (
        <AttackTargetsStep
          kind={kind}
          actorRound={actorRound}
          sourceAttacks={weapons}
          attacks={formData.attacks}
          onTarget={declaration.selectTarget}
          onBo={declaration.setBo}
          onRange={declaration.setRange}
          onProtector={declaration.toggleProtector}
          onProtectorPosition={declaration.setProtectorPosition}
          fixedOb={action.reaction?.obOverride}
          footer={
            boltOb !== undefined && targeted.length > 1 ? (
              <BoltSplitFields
                bo={boltOb}
                attacks={targeted}
                value={obSplit}
                onChange={setObSplit}
                targetName={targetName}
              />
            ) : undefined
          }
        />
      ),
    },
    { id: 'modifiers', label: t('modifiers'), content: modifiers },
    ...(withParry
      ? [
          {
            id: 'parry',
            label: kind === 'melee' ? t('parry') : t('shield-maneuver'),
            content: (
              <ParryStep
                formData={formData}
                setFormData={setFormData}
                exclusions={action.parryExclusions}
                sourceActorId={action.actorId}
                shieldInputs={shieldInputs}
                onShieldInput={(attackName, input) => setShieldInputs((prev) => ({ ...prev, [attackName]: input }))}
                withParries={kind === 'melee'}
              />
            ),
          },
        ]
      : []),
    { id: 'rolls', label: t('rolls'), content: rolls },
    { id: 'result', label: t('result'), content: result },
  ];

  const rollsStep = withParry ? 3 : 2;
  let primary;
  if (step === 0) primary = { label: t('next'), disabled: !targetsReady, onClick: () => setLocalStep(1) };
  else if (step === 1)
    primary = {
      label: t('prepare'),
      disabled: busy || targeted.length === 0 || (splitting && !boltSplitValid(boltOb!, splitParts, targeted.length)),
      onClick: prepare,
      resolves: true,
    };
  else if (withParry && step === 2)
    primary = { label: kind === 'melee' ? t('parry') : t('shield-maneuver'), disabled: busy, onClick: parry };
  else if (step === rollsStep)
    primary = { label: t('apply'), disabled: busy || action.status !== 'pending_apply', onClick: apply };

  return (
    <ActionFlow
      action={action}
      steps={[...leadingSteps, ...steps]}
      activeIndex={leadingSteps.length + step}
      primary={primary}
      back={step === 1 && unprepared ? { label: t('back'), onClick: () => setLocalStep(0) } : undefined}
      onDeleted={onDeleted}
      onNextPending={onNextPending}
    />
  );
};

export default AttackFlow;
