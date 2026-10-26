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
  DEFAULT_SPELL_OPTIONS,
  SpellFailurePp,
  SpellOptions,
  SpellPreview,
  SpellRealm,
  SpellTargetRoll,
} from '../../../../api/action.dto';
import { ActorRound } from '../../../../api/actor-rounds.dto';
import { isActionClosed } from '../../../../services/ap-service';
import { useTacticalNotify } from '../../../../services/notify-service';
import ActionFlow from '../../ActionFlow';
import { actorCharacter } from '../../SpellDeclareDialog';
import SpellOptionsStep from './SpellOptionsStep';
import SpellResult from './SpellResult';
import SpellTargetsSection from './SpellTargetsSection';

/** Spells whose targets take a resistance roll (spec 028 `resistance.kind`), as the API decides. */
const RR_KINDS = ['realm', 'informational', 'willing'];

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
 * A spell cast in the side panel (spec 030): the spell chosen when it was declared, the choices of Table 4-2 with the
 * predicted SCR, the open-ended roll, then the spell failure roll of a failed cast, the resistance rolls of the
 * targets of a successful one and the power points to spend (the spell's, or what the failure result suggests).
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
  const resolveResistance = (targets: SpellTargetRoll[]) => run(() => resolveSpellResistance(action.id, targets, auth));
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
  const allowsRr = spell.result === 'success' && RR_KINDS.includes(spell.spell.resistance?.kind ?? '');
  const candidates = (actorRounds ?? []).filter((each) => each.round === actorRound.round);
  const missingPreparation = !!preview?.needsPreparation && options.preparationRounds < 1;

  const resultContent =
    action.status === 'pending_roll' ? (
      <Stack spacing={2}>
        <SpellResult spell={spell} />
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
        <Box sx={{ maxWidth: 260 }}>
          <RollField
            spec={OPEN_D100}
            label={t('spell-failure-roll')}
            value={failureRoll}
            onChange={(value) => setFailureRoll(value.total)}
            onClear={() => setFailureRoll(null)}
          />
        </Box>
      </Stack>
    ) : action.status === 'pending_apply' ? (
      <Stack spacing={2}>
        <SpellResult spell={spell} />
        {allowsRr && <SpellTargetsSection spell={spell} candidates={candidates} busy={busy} onResolve={resolveResistance} />}
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
      </Stack>
    ) : (
      <SpellResult spell={spell} />
    );

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
      summary: preview ? `${t('spell-scr')} ${formatBonus(preview.bonus)}` : undefined,
      content: <SpellOptionsStep options={options} needsPreparation={!!preview?.needsPreparation} onChange={(patch) => setOptions((prev) => ({ ...prev, ...patch }))} />,
    },
    {
      id: 'roll',
      label: t('roll'),
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
              modifiers={preview.modifiers}
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
    { id: 'result', label: t('result'), content: resultContent },
  ];

  const declared = action.status === 'declared' && !done;
  const current = declared ? step : 3;
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
        : { label: t('spell-apply'), disabled: busy, onClick: apply };

  return (
    <ActionFlow
      action={action}
      steps={steps}
      activeIndex={current}
      primary={primary}
      back={declared && current === 2 ? { label: t('back'), onClick: () => setStep(1) } : undefined}
      onDeleted={onDeleted}
      onNextPending={onNextPending}
    />
  );
};

export default SpellCastFlow;
