import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Stack } from '@mui/material';
import { ConfirmDialog, FlowStep, useApiNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import { applyAttack, declareParry, prepareAttack } from '../../../api/action';
import { Action, ActionParry, ParryDeclaration } from '../../../api/action.dto';
import { ActorRound, ActorRoundAttack } from '../../../api/actor-rounds.dto';
import { useCombatGame, useCombatRound, useCombatActions } from '../../../combat/combat-context';
import { useNotifyWarnings } from '../../../hooks/useActionWarnings';
import { useBusyAction } from '../../../hooks/useBusyAction';
import { actorRoundHasEffect } from '../../../services/actor-round-service';
import { attackLabel } from '../../../services/attack-label';
import { phaseNumber } from '../../../services/phase-service';
import ActionFlow from '../ActionFlow';
import { AttackResults } from '../ActionResults';
import AttackModifiersStep from './AttackModifiersStep';
import AttackTargetsStep from './AttackTargetsStep';
import BoltSplitFields, { boltSplitValid } from './BoltSplitFields';
import { isManeuverInputReady, parryManeuverFields } from './ManeuverRollFields';
import ParryStep from './ParryStep';
import { ShieldManeuverInput, shieldManeuverAttacks, shieldManeuverItems } from './ShieldManeuverSection';
import { canModifyAttack, isModifyLossEmpty, lostOnModify, ModifyLoss, stepOf } from './attack-flow-rules';
import { overlappingFreeMovementPace } from './free-movement-pace';
import { specialManeuversReady } from './modifiers/special-maneuvers';
import ResolveAttackFormRoll from './resolve/ResolveAttackFormRoll';
import { modifiersSummary, parrySummary, rollsSummary } from './step-summaries';
import { AttackKind, useAttackDeclaration } from './useAttackDeclaration';

/**
 * Melee or ranged attack in the side panel: targets (with OB, protectors or range) → modifiers (one tab per
 * weapon) → parry (melee) → rolls (attack, criticals, fumble) → result. The step follows the action
 * status from the API; before "Prepare" the user moves between targets and modifiers.
 *
 * Workspace spec 101: until it is applied, "Change attack" (or "Edit from here" on a reviewed step) goes back to the
 * modifiers or the targets with what the attack had; preparing it again drops its parries and rolls, so it asks first
 * when there are any.
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
  const notify = useApiNotify();
  const notifyWarnings = useNotifyWarnings();
  const { game } = useCombatGame();
  const { actorRounds, roundActions } = useCombatRound();
  const { updateAction, refreshActorRounds, refreshRound } = useCombatActions();
  const declaration = useAttackDeclaration(action, actorRound, kind, sourceAttacks);
  const labelOf = (attackName: string) => attackLabel(attackName, t);
  const weapons = sourceAttacks ?? actorRound.attacks;
  const { formData, setFormData, targeted, changing, startChange, endChange } = declaration;
  const [localStep, setLocalStep] = useState(0);
  const [tab, setTab] = useState(0);
  const { busy, run } = useBusyAction();
  // Workspace spec 077: the Shield maneuvers typed in the parry step, and the OB split of a bolt
  const [shieldInputs, setShieldInputs] = useState<Record<string, ShieldManeuverInput>>({});
  const [obSplit, setObSplit] = useState<number[] | null>(null);
  // Workspace spec 101: what going back drops, asked for before (with the step to go back to), and a new set of roll
  // forms once the attack is prepared again, so nothing typed before stays.
  const [confirmModify, setConfirmModify] = useState<{ loss: ModifyLoss; step: number } | null>(null);
  const [generation, setGeneration] = useState(0);
  // Melee attacks always go through the parry step; a ranged one only for the Shield maneuvers of its defenders.
  const shieldStep = shieldManeuverAttacks(formData.attacks).length > 0;
  const withParry = kind === 'melee' || shieldStep;
  const step = changing ? localStep : stepOf(action, withParry, localStep);
  const targetName = (targetId: string) => actorRounds?.find((ar) => ar.actorId === targetId)?.actorName ?? '';
  // Workspace spec 080: the API applies the pace of a free movement made during the attack on its own
  const freePace = overlappingFreeMovementPace(roundActions ?? [], action, game ? phaseNumber(game.phase) : 0);

  const call = (request: Promise<Action>, message: string, after?: () => void) => {
    run(
      request.then((updated) => {
        updateAction(updated);
        // Workspace spec 083: the OB committed changes the actors and the other open actions of the round.
        refreshRound();
        notify.success(message);
        // Workspace spec 068: a balking attacker that charges, an attack with a useless arm
        notifyWarnings(updated.warnings);
        after?.();
      })
    );
  };

  const splitting = boltOb !== undefined && targeted.length > 1 && obSplit !== null;
  const splitParts = targeted.map((_, index) => obSplit?.[index] ?? 0);
  const prepare = () =>
    call(
      prepareAttack(action.id, { ...formData, attacks: targeted, ...(splitting ? { obSplit: splitParts } : {}) }, auth),
      t('attack-prepared'),
      () => {
        if (changing) setGeneration((value) => value + 1);
        endChange();
      }
    );
  const needsParryManeuver = (p: ActionParry) => !!p.parryManeuver?.required && !p.carriedOver && p.parry > 0;
  const parryManeuverMissing = (formData.parries ?? []).some(
    (p) => needsParryManeuver(p) && !isManeuverInputReady(p.maneuverInput)
  );
  const parry = () => {
    const shieldManeuvers = shieldManeuverItems(formData.attacks, shieldInputs);
    const parries = (formData.parries ?? []).map((p) => ({
      parryId: p.id,
      parry: p.parry,
      // Spec 079, A2, and spec 084: only for the parries that need the maneuver and give any OB
      ...(needsParryManeuver(p) ? parryManeuverFields(p.maneuverInput) : {}),
    }));
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
    changing ||
    action.status === 'declared' ||
    action.status === 'held' ||
    (action.actionType === 'cast_spell' && !action.attacks?.length);

  // Targets and modifiers can be chosen at any time; "Prepare" fixes the AP of the attack, so it waits for the
  // minimum AP of its profile (readiness from the API), unless the attack is forced.
  // Workspace spec 082: an attack at 0 is not made, the API rejects it
  const spendsRoundOb = action.actionType !== 'cast_spell' && !action.strayShot && !action.reaction;
  // Workspace spec 101: any attack prepared and not applied yet can go back to its targets and modifiers.
  const modifiable = !changing && canModifyAttack(action);
  const enterModify = (toStep: number) => {
    setLocalStep(toStep);
    setTab(0);
    startChange();
    // A bolt with several targets keeps how its OB was split.
    const prepared = action.attacks ?? [];
    if (boltOb !== undefined && prepared.length > 1) setObSplit(prepared.map((attack) => attack.modifiers.bo ?? 0));
  };
  const modify = (toStep: number) => {
    const loss = lostOnModify(action, actorRounds);
    if (isModifyLossEmpty(loss)) enterModify(toStep);
    else setConfirmModify({ loss, step: toStep });
  };
  const changingNotice = changing ? (
    <Alert severity="info" variant="outlined">
      {t('attack-modify-help')}
    </Alert>
  ) : null;
  const targetsReady =
    targeted.length > 0 &&
    (kind === 'melee' || targeted.every((a) => !!a.modifiers.range)) &&
    (!spendsRoundOb || targeted.every((a) => (a.modifiers.bo ?? 0) > 0));
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

  // Workspace spec 079, A6: the second attack of a stray shot, at OB 0 against the combatant the API chose
  const strayShotNotice =
    action.strayShot && unprepared ? (
      <Alert severity="info" variant="outlined">
        {t('stray-shot-attack-help', { target: targetName(action.strayShot.targetActorId) })}
      </Alert>
    ) : null;

  const rolls = (
    <Stack spacing={3}>
      {formData.attacks.map((attack, index) => (
        <ResolveAttackFormRoll
          key={`${attack.attackName}-${generation}`}
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
        <Stack spacing={1.5}>
          {strayShotNotice}
          {changingNotice}
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
            fixedOb={action.strayShot ? 0 : action.reaction?.obOverride}
            spendsRoundOb={spendsRoundOb}
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
        </Stack>
      ),
    },
    {
      id: 'modifiers',
      label: t('modifiers'),
      summary: modifiersSummary(
        attacksShown,
        kind,
        t,
        actorRound.traits?.map((trait) => trait.traitId)
      ),
      content:
        attacksShown.length > 0 ? (
          <Stack spacing={1.5}>
            {changingNotice}
            <AttackModifiersStep
              action={action}
              actorRound={actorRound}
              kind={kind}
              formData={formData}
              setFormData={setFormData}
              attacksShown={attacksShown}
              shownTab={shownTab}
              onTab={setTab}
              unprepared={unprepared}
              labelOf={labelOf}
              target={actorRounds?.find((ar) => ar.actorId === attacksShown[shownTab].modifiers.targetId)}
              chargeFear={chargeFear}
              freePace={freePace ?? undefined}
              strayShotNotice={strayShotNotice}
            />
          </Stack>
        ) : null,
    },
    ...(withParry
      ? [
          {
            id: 'parry',
            label: kind === 'melee' ? t('parry') : t('shield-maneuver'),
            summary: parrySummary(action, actorRounds, t),
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
    { id: 'rolls', label: t('rolls'), summary: rollsSummary(action.attacks ?? [], t), content: rolls },
    { id: 'result', label: t('result'), content: result },
  ];

  const rollsStep = withParry ? 3 : 2;
  const back = () => {
    if (step === 1 && unprepared) return { label: t('back'), onClick: () => setLocalStep(0) };
    if (changing) return { label: t('cancel'), onClick: endChange };
    if (modifiable) return { label: t('attack-modify'), onClick: () => modify(1) };
    return undefined;
  };
  // Workspace spec 085, 1.4: what is missing while the main button is disabled. "Apply" has none: the rolls step
  // already says, attack by attack, which roll comes next.
  const targetsReason = () => {
    if (targeted.length === 0) return t('reason-pick-target');
    if (kind !== 'melee' && !targeted.every((a) => !!a.modifiers.range)) return t('reason-pick-range');
    return t('reason-ob-zero');
  };
  const prepareReason = () => {
    if (targeted.length === 0) return t('reason-pick-target');
    if (!targeted.every((a) => specialManeuversReady(a.modifiers))) return t('reason-special-maneuver');
    return t('reason-bolt-split');
  };
  // Workspace spec 085, 2.3: the button says what happens: the parry it declares, or that nobody parries
  const parryButtonLabel = () => {
    if (kind !== 'melee') return t('shield-maneuver');
    const fresh = (formData.parries ?? []).filter((p) => !p.carriedOver);
    const total = fresh.reduce((sum, p) => sum + (p.parry || 0), 0);
    if (total > 0) return t('declare-parry-n', { parry: total });
    return fresh.length > 0 || shieldManeuverAttacks(formData.attacks).length === 0
      ? t('continue-without-parry')
      : t('shield-maneuver');
  };
  let primary;
  if (step === 0)
    primary = {
      label: t('next'),
      disabled: !targetsReady,
      disabledReason: targetsReady ? undefined : targetsReason(),
      onClick: () => setLocalStep(1),
    };
  else if (step === 1)
    primary = {
      label: t('prepare'),
      disabled:
        busy ||
        targeted.length === 0 ||
        // Workspace spec 079, A7: a disarm needs the defender's roll
        !targeted.every((a) => specialManeuversReady(a.modifiers)) ||
        (splitting && !boltSplitValid(boltOb!, splitParts, targeted.length)),
      onClick: prepare,
      resolves: true,
      disabledReason: busy ? undefined : prepareReason(),
    };
  else if (withParry && step === 2)
    primary = {
      label: parryButtonLabel(),
      disabled: busy || parryManeuverMissing,
      disabledReason: parryManeuverMissing ? t('reason-parry-maneuver') : undefined,
      onClick: parry,
    };
  else if (step === rollsStep)
    primary = {
      label: t('apply'),
      disabled: busy || action.status !== 'pending_apply',
      onClick: apply,
    };

  // Workspace spec 101: a reviewed targets or modifiers step of a prepared attack can be edited again from there.
  const reviewAction = (stepId: string) => {
    const toStep = stepId === 'targets' ? 0 : stepId === 'modifiers' ? 1 : -1;
    if (!modifiable || toStep < 0) return undefined;
    return { label: t('flow-edit-from-here'), onClick: () => modify(toStep) };
  };

  const loss = confirmModify?.loss;
  return (
    <>
      <ActionFlow
        action={action}
        steps={[...leadingSteps, ...steps]}
        activeIndex={leadingSteps.length + step}
        primary={primary}
        back={back()}
        reviewAction={reviewAction}
        onDeleted={onDeleted}
        onNextPending={onNextPending}
      />
      <ConfirmDialog
        open={!!confirmModify}
        title={t('attack-modify-confirm-title')}
        message={
          loss ? (
            <Stack spacing={1}>
              <span>{t('attack-modify-confirm-text')}</span>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {loss.parries.map((parry) => (
                  <li key={parry.actorId}>
                    {t('attack-modify-lost-parry', { actor: parry.actorName, parry: parry.parry })}
                  </li>
                ))}
                {loss.shieldManeuvers > 0 && <li>{t('attack-modify-lost-shield', { count: loss.shieldManeuvers })}</li>}
                {loss.rolls.map((roll) => (
                  <li key={roll.attackName}>
                    {t('attack-modify-lost-roll', {
                      attack: labelOf(roll.attackName),
                      rolls: roll.kinds.map((kind) => t(`attack-modify-roll-${kind}`)).join(', '),
                    })}
                  </li>
                ))}
              </ul>
            </Stack>
          ) : (
            ''
          )
        }
        confirmLabel={t('attack-modify')}
        onConfirm={() => {
          if (confirmModify) enterModify(confirmModify.step);
          setConfirmModify(null);
        }}
        onClose={() => setConfirmModify(null)}
      />
    </>
  );
};

export default AttackFlow;
