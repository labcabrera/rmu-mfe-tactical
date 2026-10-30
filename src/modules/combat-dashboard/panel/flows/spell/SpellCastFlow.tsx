import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Box, CircularProgress, MenuItem, Stack, TextField } from '@mui/material';
import {
  fetchCharacters,
  FlowStep,
  formatBonus,
  NumericInput,
  OPEN_D100,
  RollBreakdown,
  RollField,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../../CombatContext';
import { applySpell, previewSpell, resolveSpellResistance, rollSpell, rollSpellFailure } from '../../../../api/action';
import {
  Action,
  ActionSpell,
  DEFAULT_SPELL_OPTIONS,
  SpellFailurePp,
  SpellOptions,
  SpellPreview,
  SpellRealm,
  SpellTargetRoll,
} from '../../../../api/action.dto';
import { ActorRound, ActorRoundAttack } from '../../../../api/actor-rounds.dto';
import { isActionClosed } from '../../../../services/ap-service';
import { useTacticalNotify } from '../../../../services/notify-service';
import ActionFlow from '../../ActionFlow';
import { actorCharacter } from '../../SpellDeclareDialog';
import AttackFlow from '../attack/AttackFlow';
import SpellOptionsStep from './SpellOptionsStep';
import {
  SpellCastingResult,
  spellAllowsRr,
  SpellOutcome,
  SpellResistanceHelp,
  SpellResistanceResults,
  targetOutcome,
} from './SpellResult';
import SpellTargetsSection from './SpellTargetsSection';

/** Power points a spell failure result suggests (the API applies the same rule when none is given). */
const failurePowerPoints = (kind: SpellFailurePp, spellPp: number, current: number): number => {
  const byKind: Record<SpellFailurePp, number> = {
    none: 0,
    one: 1,
    'half-down': Math.floor(spellPp / 2),
    'half-up': Math.ceil(spellPp / 2),
    normal: spellPp,
    double: spellPp * 2,
    triple: spellPp * 3,
    all: current,
  };
  return Math.max(0, Math.min(byKind[kind], current));
};

/**
 * The attack of a bolt or ball spell read as ranged weapons (spec 030, phase 4): a bolt strikes one target, a ball
 * makes one attack per target in its area (`fire-ball-1`, `fire-ball-2`…), up to the other actors of the round.
 */
const spellSourceAttacks = (spell: ActionSpell, others: number): ActorRoundAttack[] => {
  const attack = spell.attack!;
  const count = attack.kind === 'ball' ? Math.max(1, others) : 1;
  return Array.from({ length: count }, (_, i) => ({
    attackName: attack.kind === 'ball' ? `${attack.attackName}-${i + 1}` : attack.attackName,
    baseBo: attack.bo,
    currentBo: attack.bo,
    type: 'ranged',
    attackTable: attack.attackTable,
    fumbleTable: attack.fumbleTable,
    attackSize: attack.attackSize,
    fumble: attack.fumble,
    canThrow: false,
    ranges: attack.ranges,
  }));
};

/**
 * A spell cast in the side panel (spec 030): the spell chosen when it was declared, the choices of Table 4-2 with the
 * predicted SCR, the open-ended roll, then the spell failure roll of a failed cast, the resistance rolls of the
 * targets of a successful one and the power points to spend (the spell's, or what the failure result suggests).
 * A successful bolt or ball goes on with the attack flow: targets and range, attack rolls and criticals; applying the
 * attack spends the spell's power points.
 */
const SpellCastFlow: FC<{
  action: Action;
  actorRound: ActorRound;
  onDeleted: () => void;
  onNextPending?: () => void;
}> = ({ action, actorRound, onDeleted, onNextPending }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const { actorRounds, characters, setCharacters, updateAction } = useContext(CombatContext)!;
  const spell = action.spell!;
  const character = actorCharacter(actorRound, characters);
  const currentPower = character?.power?.current ?? 0;
  const done = isActionClosed(action);
  const [options, setOptions] = useState<SpellOptions>(() => ({ ...DEFAULT_SPELL_OPTIONS, ...(spell.options ?? {}) }));
  const [preview, setPreview] = useState<SpellPreview | null>(null);
  const [roll, setRoll] = useState<number | null>(null);
  const [failureRoll, setFailureRoll] = useState<number | null>(null);
  const [failureRealm, setFailureRealm] = useState<SpellRealm>(spell.spell.listRealms[0] ?? 'essence');
  const [powerPoints, setPowerPoints] = useState<number | null>(null);
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [skipRr, setSkipRr] = useState(false);
  const [editRr, setEditRr] = useState(false);

  useEffect(() => {
    if (action.status !== 'declared') return;
    let cancelled = false;
    previewSpell(action.id, options, auth)
      .then((data) => !cancelled && setPreview(data))
      .catch((err) => !cancelled && notify.error(err));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action.id, action.status, action.actionPoints, options]);

  /** Runs a call that returns the action and keeps it in the dashboard. */
  const run = (call: () => Promise<Action>, then?: (result: Action) => void) => {
    setBusy(true);
    call()
      .then((result) => {
        updateAction(result);
        then?.(result);
      })
      .catch((err: Error) => notify.error(err))
      .finally(() => setBusy(false));
  };

  /** Reads the caster again once the cast took its power points. */
  const refreshCaster = () => {
    if (!character) return;
    fetchCharacters(`id==${character.id}`, 0, 1, auth)
      .then((page) => {
        const updated = page.content[0];
        if (updated) setCharacters((prev) => (prev ?? []).map((each) => (each.id === updated.id ? updated : each)));
      })
      .catch((err) => notify.error(err));
  };

  const castRoll = () => roll !== null && run(() => rollSpell(action.id, options, roll, auth));
  const castFailure = () =>
    failureRoll !== null &&
    run(() =>
      rollSpellFailure(action.id, failureRoll, spell.spell.listRealms.length > 1 ? failureRealm : undefined, auth)
    );
  const resolveResistance = (targets: SpellTargetRoll[]) =>
    run(
      () => resolveSpellResistance(action.id, targets, auth),
      () => setEditRr(false)
    );
  const apply = () =>
    run(
      () => applySpell(action.id, powerPoints ?? undefined, auth),
      () => {
        refreshCaster();
        notify.success(t('spell-applied'));
      }
    );

  const suggestedPower = spell.failure
    ? failurePowerPoints(spell.failure.suggestedPp, spell.spell.powerPoints, currentPower)
    : spell.spell.powerPoints;
  const allowsRr = spellAllowsRr(spell);
  const rolledTargets = (spell.targets ?? []).length > 0;
  const candidates = (actorRounds ?? []).filter((each) => each.round === actorRound.round);
  const missingPreparation = !!preview?.needsPreparation && options.preparationRounds < 1;
  const scr = spell.roll?.totalRoll;

  const castingContent = (
    <Stack spacing={2}>
      <SpellCastingResult spell={spell} />
      {spell.result === 'success' && spell.attack && (
        <Alert severity="info">
          {t(`spell-attack-next-${spell.attack.kind}`, {
            table: t(`spell-attack-table-${spell.attack.attackTable}`),
            bo: formatBonus(spell.attack.bo),
            fumble: spell.attack.fumble,
          })}
        </Alert>
      )}
      {action.status === 'pending_roll' && (
        <>
          {spell.spell.listRealms.length > 1 && (
            <TextField
              select
              size="small"
              label={t('realm')}
              value={failureRealm}
              onChange={(e) => setFailureRealm(e.target.value as SpellRealm)}
              sx={{ maxWidth: 220 }}
            >
              {spell.spell.listRealms.map((realm) => (
                <MenuItem key={realm} value={realm}>
                  {t(realm)}
                </MenuItem>
              ))}
            </TextField>
          )}
          <RollField
            spec={OPEN_D100}
            label={t('spell-failure-roll')}
            value={failureRoll}
            onChange={(value) => setFailureRoll(value.total)}
            onClear={() => setFailureRoll(null)}
          />
        </>
      )}
    </Stack>
  );

  const resistanceContent = (
    <Stack spacing={2}>
      <SpellResistanceHelp spell={spell} />
      <SpellResistanceResults spell={spell} />
      {action.status === 'pending_apply' && (
        <SpellTargetsSection
          key={(spell.targets ?? []).map((target) => target.actorId).join()}
          spell={spell}
          candidates={candidates}
          busy={busy}
          onResolve={(targets) => {
            setSkipRr(false);
            resolveResistance(targets);
          }}
        />
      )}
    </Stack>
  );

  const outcomeContent = (
    <Stack spacing={2}>
      <SpellOutcome spell={spell} />
      {action.status === 'pending_apply' && (
        <Box sx={{ maxWidth: 260 }}>
          <NumericInput
            label={t('spell-power-points-to-spend')}
            placeholder={String(suggestedPower)}
            value={powerPoints}
            onChange={setPowerPoints}
            integer
            allowNegatives={false}
            min={0}
          />
        </Box>
      )}
    </Stack>
  );

  const castingSummary =
    scr === undefined || !spell.result ? undefined : `${t('spell-scr')} ${scr} · ${t(`spell-result-${spell.result}`)}`;
  const steps: FlowStep[] = [
    {
      id: 'spell',
      label: t('spell'),
      summary: [
        `${spell.spell.level}. ${spell.spell.name}`,
        spell.spell.listName ?? spell.spell.listCode,
        t('spell-power-points', { count: spell.spell.powerPoints }),
        action.freeAction ? t('instantaneous') : null,
      ]
        .filter(Boolean)
        .join(' · '),
    },
    {
      id: 'modifiers',
      label: t('modifiers'),
      summary: preview ? formatBonus(preview.bonus) : undefined,
      content: (
        <SpellOptionsStep
          options={options}
          needsPreparation={!!preview?.needsPreparation}
          onChange={(patch) => setOptions((prev) => ({ ...prev, ...patch }))}
        />
      ),
    },
    {
      id: 'roll',
      label: t('spell-roll'),
      summary: spell.roll?.roll ?? roll ?? undefined,
      content: (
        <Stack spacing={2}>
          <RollField
            spec={OPEN_D100}
            label={t('spell-roll')}
            value={roll}
            onChange={(value) => setRoll(value.total)}
            onClear={() => setRoll(null)}
          />
          {preview ? (
            <RollBreakdown
              context="spell-cast"
              modifiers={preview.modifiers}
              skipped={preview.skipped}
              roll={roll}
              totalLabel={roll === null ? t('predicted-total') : t('spell-scr')}
            />
          ) : (
            <CircularProgress size={24} />
          )}
          {missingPreparation && <Alert severity="warning">{t('err-overcast-needs-preparation')}</Alert>}
        </Stack>
      ),
    },
    {
      id: 'casting',
      label: t('spell-step-casting'),
      summary: castingSummary,
      content: castingContent,
      // Spec 052: once the failure roll is in, the step only shows results, and their explanations stay open
      reviewInteractive: action.status !== 'pending_roll',
    },
    ...(allowsRr
      ? [
          {
            id: 'resistance',
            label: t('spell-step-resistance'),
            summary: rolledTargets
              ? (spell.targets ?? []).map((target) => targetOutcome(target, t)).join(' · ')
              : t('spell-rr-skipped'),
            content: resistanceContent,
            reviewInteractive: action.status !== 'pending_apply',
          },
        ]
      : []),
    { id: 'outcome', label: t('spell-step-outcome'), content: outcomeContent },
  ];

  // A successful attack spell resolves its attack with the attack flow, unless it was applied without one.
  const attackSpell =
    spell.result === 'success' && !!spell.attack && (!!action.attacks?.length || action.status === 'pending_apply');
  if (attackSpell) {
    return (
      <AttackFlow
        kind="ranged"
        action={action}
        actorRound={actorRound}
        onDeleted={onDeleted}
        onNextPending={onNextPending}
        sourceAttacks={spellSourceAttacks(spell, candidates.length - 1)}
        leadingSteps={steps.slice(0, 4)}
        onApplied={refreshCaster}
      />
    );
  }

  const last = steps.length - 1;
  const declared = action.status === 'declared' && !done;
  // Resistance rolls come before applying: skipping them is an explicit choice of the game master.
  const atResistance = action.status === 'pending_apply' && allowsRr && (!rolledTargets || editRr) && !skipRr;
  const current = declared ? step : action.status === 'pending_roll' ? 3 : atResistance ? 4 : last;
  const primary = done
    ? undefined
    : action.status === 'declared'
      ? current === 1
        ? { label: t('next'), disabled: !preview, onClick: () => setStep(2) }
        : {
            label: t('resolve'),
            disabled: !preview || roll === null || missingPreparation || busy,
            onClick: castRoll,
            resolves: true,
          }
      : action.status === 'pending_roll'
        ? { label: t('spell-roll-failure'), disabled: failureRoll === null || busy, onClick: castFailure }
        : atResistance
          ? rolledTargets
            ? { label: t('next'), disabled: busy, onClick: () => setEditRr(false) }
            : { label: t('spell-skip-resistance'), disabled: busy, onClick: () => setSkipRr(true) }
          : { label: t('spell-apply'), disabled: busy, onClick: apply };
  const back =
    declared && current === 2
      ? { label: t('back'), onClick: () => setStep(1) }
      : action.status === 'pending_apply' && allowsRr && current === last
        ? {
            label: t('spell-step-resistance'),
            onClick: () => {
              setSkipRr(false);
              setEditRr(true);
            },
          }
        : undefined;

  return (
    <ActionFlow
      action={action}
      steps={steps}
      activeIndex={current}
      primary={primary}
      back={back}
      onDeleted={onDeleted}
      onNextPending={onNextPending}
    />
  );
};

export default SpellCastFlow;
