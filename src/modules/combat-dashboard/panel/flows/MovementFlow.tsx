import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import {
  Alert,
  Box,
  ButtonBase,
  Chip,
  FormControlLabel,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  DifficultyPicker,
  GRAPPLE_FEATS,
  GrappleFeat,
  FlowStep,
  formatBonus,
  NumberPadField,
  selectableSx,
  OPEN_D100,
  RollField,
  ChipRow,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { resolveMovement } from '../../../api/action';
import { Action, ActionMovement, MOVEMENT_LIGHT_OPTIONS, MOVEMENT_TABLE } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import { useActionConfirm, useNotifyWarnings } from '../../../services/action-warnings';
import { actorRoundHasEffect, isActorRoundGrappling, isActorRoundProne } from '../../../services/actor-round-service';
import { isActionClosed } from '../../../services/ap-service';
import { actorOpenEnded } from '../../../services/combat-talents-service';
import {
  dashBlockedReason,
  effectiveBmr,
  effectiveMaxPace,
  injuryPaceLimit,
  normalMovementFatigue,
  paceIndex,
  paceOfAp,
  PACES,
  roundMovement,
  SLOW_MAX_PACE,
} from '../../../services/movement-service';
import { useTacticalNotify } from '../../../services/notify-service';
import { useSkillService } from '../../../services/skill-service';
import OptionTiles from '../../action-dialogs/attack-modifiers/pickers/OptionTiles';
import { phaseNumber } from '../../actor-rounds/round-grid';
import ActionFlow from '../ActionFlow';
import { MovementResult } from './ActionResults';
import { rememberedLight, rememberLight } from './maneuver/maneuver-form';
import { useSkillDifficultyGuide } from './useSkillDifficultyGuide';

const MOVEMENT_SKILLS = ['running', 'swimming', 'climbing', 'flying'];

/** Keeps the height of the caption of a pace without a penalty. */
const NBSP = '\u00a0';

const initialForm = (action: Action, actorRound: ActorRound, light: string | null): ActionMovement =>
  action.movement
    ? { modifiers: action.movement.modifiers, roll: action.movement.roll ?? { roll: null } }
    : {
        modifiers: {
          pace: '',
          requiredManeuver: false,
          skillId: 'running',
          difficulty: actorRound.movement?.baseDifficulty || null,
          customBonus: null,
          light,
        },
        roll: { roll: null },
      };

/**
 * Movement in the side panel: setup (skill, whether it needs a maneuver, difficulty), pace, the maneuver
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
  const notify = useTacticalNotify();
  const { game, strategicGame, actorRounds, roundActions, updateAction, refreshActorRounds } =
    useContext(CombatContext)!;
  const { getSkillBonus } = useSkillService();
  const confirm = useActionConfirm();
  const notifyWarnings = useNotifyWarnings();
  const [form, setForm] = useState<ActionMovement>(() =>
    // Workspace spec 076: the ambient light of the game first, else the last one chosen
    initialForm(action, actorRound, game?.environment?.light ?? rememberedLight(action.gameId))
  );
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  // Completed, or ended without being resolved (interrupted, expired, carried to the next round).
  const done = isActionClosed(action);
  const { modifiers } = form;
  const setModifiers = (change: Partial<ActionMovement['modifiers']>) =>
    setForm((prev) => ({ ...prev, modifiers: { ...prev.modifiers, ...change } }));

  // Workspace spec 080 (Core Law §8.2): a free movement takes no AP, covers the phases it spans and goes up to run.
  const freeMovement = !!action.freeAction;
  const currentPhase = game ? phaseNumber(game.phase) : 0;
  // A free movement covers its pace per phase spanned; a normal one 1 BMR per AP (the API counts them in its ledger).
  const actionPoints = freeMovement
    ? Math.max(1, (currentPhase || action.phaseStart) - action.phaseStart + 1)
    : Math.max(1, action.actionPoints ?? 1);
  const freeMaxIndex = freeMovement ? paceIndex('run') : MOVEMENT_TABLE.length;
  const scale = strategicGame?.options?.boardScaleMultiplier || 1;
  // Workspace spec 068: a splinted or cast leg caps the pace; routed and broken actors flee at running pace or faster
  const injuryLimit = injuryPaceLimit(actorRound);
  const twoFoci = (actorRound.concentration ?? []).length > 1;
  const maxPaceIndex = Math.min(
    MOVEMENT_TABLE.findIndex((p) => p.id === actorRound.movement.maxPace),
    injuryLimit ? paceIndex(injuryLimit) : MOVEMENT_TABLE.length,
    twoFoci ? paceIndex('creep') : MOVEMENT_TABLE.length
  );
  const fleeing = actorRoundHasEffect(actorRound, ['fear-routed', 'fear-broken']);
  const fearCap = actorRoundHasEffect(actorRound, ['fear-retreat'])
    ? { state: 'fear-retreat', index: paceIndex('jog') }
    : actorRoundHasEffect(actorRound, ['fear-balk'])
      ? { state: 'fear-balk', index: paceIndex('walk') }
      : undefined;
  const skillBonus = (skillId: string) => getSkillBonus(skillId, actorRound);
  const guide = useSkillDifficultyGuide(modifiers.requiredManeuver ? modifiers.skillId : null);
  // Workspace spec 081: half movement, concentration and moving backwards or prone halve the BMR (the API applies it);
  // grappled, or holding someone, the actor needs a contested Feat of Strength to move away (spec 077).
  const backwards = !!modifiers.backwards;
  const prone = isActorRoundProne(actorRound);
  const slow = backwards || prone;
  const { bmr, reasons: bmrReasons } = effectiveBmr(actorRound, backwards);
  const distance = (multiplier: number) => bmr * multiplier * actionPoints;
  // What the movement of the round has left, as the API cuts it (decision 7).
  const round = roundMovement(roundActions ?? [], action.actorId, action.round, action.id);
  const limitIndex = Math.min(
    paceIndex(effectiveMaxPace(actorRound, actorRounds).pace),
    slow ? paceIndex(SLOW_MAX_PACE) : PACES.length - 1
  );
  const left = Math.max(0, bmr * PACES[limitIndex].perRound - round.moved);
  const nothingLeft = bmr > 0 && left <= 0.001;
  const dashing = !freeMovement && modifiers.pace === 'dash';
  const dashBlocked = freeMovement ? undefined : dashBlockedReason(actorRound, round.own, currentPhase, backwards);
  const roundPace = paceOfAp(round.normalAp + actionPoints);
  const normalDistance = Math.min(left, distance(dashing ? 1.25 : 1));
  const talliedFatigue = !dashing && !['climbing', 'swimming'].includes(modifiers.skillId);
  const addedFatigue =
    normalMovementFatigue(round.normalAp, actionPoints) * (strategicGame?.options?.fatigueMultiplier || 1);
  const blocked = nothingLeft || (!freeMovement && twoFoci);
  const grappleFeatNeeded = isActorRoundGrappling(actorRound, actorRounds ?? []);

  const resolve = () => {
    setBusy(true);
    // Workspace spec 068: exertion with a wound that reopens asks for a confirmation first
    confirm
      .run((confirmed) => {
        // A normal movement sends no pace unless it dashes: the API takes it from the AP of the round.
        const body = { ...form, modifiers: { ...modifiers, pace: modifiers.pace || undefined } };
        return resolveMovement(action.id, confirmed ? { ...body, confirm: true } : body, auth);
      })
      .then((result: Action) => {
        updateAction(result);
        refreshActorRounds();
        notify.success(t('movement-resolved'));
        notifyWarnings(result.warnings);
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  const setup = (
    <Stack spacing={2}>
      <ChipRow>
        <Chip size="small" variant="outlined" label={`${t('max-pace')}: ${t(actorRound.movement.maxPace)}`} />
        <Chip
          size="small"
          variant="outlined"
          label={`${t('maneuver-penalty')}: ${formatBonus(actorRound.movement.penalty)}`}
        />
        {/* The movement roll also takes the actor's penalties (`penalty-<source>` in its breakdown). */}
        {modifiers.requiredManeuver &&
          (actorRound.penalty?.modifiers ?? [])
            .filter((penalty) => penalty.value !== 0)
            .map((penalty) => (
              <Chip
                key={penalty.id}
                size="small"
                variant="outlined"
                color={penalty.value < 0 ? 'error' : 'default'}
                label={`${t(`penalty-${penalty.source}`, { defaultValue: penalty.source })}: ${formatBonus(penalty.value)}`}
              />
            ))}
      </ChipRow>
      <Box>
        <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 0.5 }}>
          {t('skill')}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }} role="radiogroup" aria-label={t('skill')}>
          {MOVEMENT_SKILLS.map((skillId) => {
            const bonus = skillBonus(skillId);
            const selected = modifiers.skillId === skillId;
            return (
              <Chip
                key={skillId}
                role="radio"
                aria-checked={selected}
                color={selected ? 'primary' : 'default'}
                label={`${t(skillId)} ${bonus === undefined ? '' : formatBonus(bonus)}`.trim()}
                onClick={() => setModifiers({ skillId })}
              />
            );
          })}
        </Box>
      </Box>
      {grappleFeatNeeded && (
        <Alert severity="warning" variant="outlined">
          <Stack spacing={1}>
            <span>{t('grapple-feat-help')}</span>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={modifiers.grappleFeat ?? null}
              onChange={(_, value: GrappleFeat | null) => setModifiers({ grappleFeat: value })}
              aria-label={t('grapple-feat')}
            >
              {GRAPPLE_FEATS.map((feat) => (
                <ToggleButton key={feat} value={feat} color={feat === 'passed' ? 'success' : 'error'}>
                  {t(`grapple-feat-${feat}`)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>
        </Alert>
      )}
      <FormControlLabel
        control={
          <Switch
            checked={modifiers.requiredManeuver}
            onChange={(e) => setModifiers({ requiredManeuver: e.target.checked })}
          />
        }
        label={t('required-maneuver')}
      />
      {modifiers.requiredManeuver && (
        <>
          <DifficultyPicker
            value={modifiers.difficulty}
            base={actorRound.movement.baseDifficulty}
            guide={guide}
            onChange={(difficulty) => setModifiers({ difficulty })}
          />
          <OptionTiles
            label={`${t('lighting')} · ${t('light-usage-helpful')}`}
            options={MOVEMENT_LIGHT_OPTIONS}
            value={modifiers.light ?? ''}
            onChange={(key) => {
              const light = key === modifiers.light ? null : key;
              rememberLight(action.gameId, light);
              setModifiers({ light });
            }}
          />
          <Box sx={{ maxWidth: 200 }}>
            <NumberPadField
              steps={[-10, -5, 5, 10]}
              label={t('custom-modifier')}
              value={modifiers.customBonus}
              onChange={(value) => setModifiers({ customBonus: value || 0 })}
              integer
            />
          </Box>
        </>
      )}
    </Stack>
  );

  const paceNotes = (
    <>
      {bmrReasons.length > 0 && (
        <ChipRow>
          {bmrReasons.map((reason) => (
            <Chip
              key={reason}
              size="small"
              variant="outlined"
              color="info"
              label={`${t(`bmr-multiplier-${reason}`)}: ${t('bmr')} ×½`}
            />
          ))}
        </ChipRow>
      )}
      <FormControlLabel
        control={
          <Switch
            checked={backwards}
            onChange={(e) => {
              const tooFast = e.target.checked && paceIndex(modifiers.pace) > paceIndex(SLOW_MAX_PACE);
              setModifiers({ backwards: e.target.checked, pace: tooFast ? '' : modifiers.pace });
            }}
          />
        }
        label={t('movement-backwards')}
      />
      {prone && (
        <Alert severity="info" variant="outlined">
          {t('movement-prone-note')}
        </Alert>
      )}
      {!freeMovement && twoFoci && (
        <Alert severity="warning" variant="outlined">
          {t('err-action-double-concentration')}
        </Alert>
      )}
      {nothingLeft && (
        <Alert severity="warning" variant="outlined">
          {t('movement-nothing-left')}
        </Alert>
      )}
    </>
  );

  const normalPace = (
    <Stack spacing={1.5}>
      {paceNotes}
      <ChipRow>
        <Chip size="small" variant="outlined" label={`${t('movement-ap')}: ${actionPoints}`} />
        <Chip
          size="small"
          variant="outlined"
          label={`${t('distance')}: ${Number(normalDistance.toFixed(1))}'${
            scale !== 1 ? ` (${Number((normalDistance * scale).toFixed(1))})` : ''
          }`}
        />
        <Chip
          size="small"
          variant="outlined"
          color="primary"
          label={`${t('movement-round-pace')}: ${t(dashing ? 'dash' : roundPace)}`}
        />
        {talliedFatigue && (
          <Chip size="small" variant="outlined" label={`${t('fatigue')}: +${Number(addedFatigue.toFixed(1))}`} />
        )}
        <Chip size="small" variant="outlined" label={`${t('movement-left')}: ${Number(left.toFixed(1))}'`} />
      </ChipRow>
      <Box>
        <FormControlLabel
          control={
            <Switch
              checked={dashing}
              disabled={!!dashBlocked && !dashing}
              onChange={(e) => setModifiers({ pace: e.target.checked ? 'dash' : '' })}
            />
          }
          label={t('movement-dash')}
        />
        <Typography variant="caption" color="text.secondary" component="div">
          {dashBlocked ? t(dashBlocked) : t('movement-dash-help')}
        </Typography>
      </Box>
    </Stack>
  );

  const freePace = (
    <Stack spacing={0.75} role="radiogroup" aria-label={t('pace')}>
      {paceNotes}
      {MOVEMENT_TABLE.map((row, index) => {
        const overMax = index > maxPaceIndex;
        const overFree = index > freeMaxIndex;
        const tooSlow = fleeing && index < paceIndex('run');
        const overSlow = slow && index > paceIndex(SLOW_MAX_PACE);
        const fearWarning = !!fearCap && index > fearCap.index;
        const selected = modifiers.pace === row.id;
        const feet = distance(row.multiplier);
        return (
          <ButtonBase
            key={row.id}
            role="radio"
            aria-checked={selected}
            disabled={overMax || overFree || tooSlow || overSlow}
            onClick={() => setModifiers({ pace: row.id })}
            sx={[
              selectableSx(selected, overMax || overFree || tooSlow || overSlow),
              {
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                alignItems: 'center',
                textAlign: 'left',
                px: 1.5,
                py: 1,
              },
            ]}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {t(row.id)}{' '}
                <Typography component="span" variant="caption" color="text.secondary">
                  {row.label}
                </Typography>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {overFree && !overMax
                  ? t('free-movement-max-run')
                  : overSlow && !overMax
                    ? t('movement-slow-max-jog')
                    : overMax && injuryLimit && index > paceIndex(injuryLimit)
                      ? t('injury-pace-limit', { pace: t(injuryLimit) })
                      : overMax
                        ? t('over-max-pace')
                        : tooSlow
                          ? t('fear-flees-at-run')
                          : fearWarning
                            ? t(`fear-pace-warning-${fearCap!.state}`)
                            : row.penalty !== '-'
                              ? freeMovement
                                ? row.penalty.split(' | ')[0]
                                : row.penalty
                              : NBSP}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {Number(feet.toFixed(1))}&apos;
              </Typography>
              {scale !== 1 && (
                <Typography variant="caption" color="text.secondary">
                  {Number((feet * scale).toFixed(1))}
                </Typography>
              )}
            </Box>
          </ButtonBase>
        );
      })}
    </Stack>
  );

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

  const steps: FlowStep[] = [
    {
      id: 'setup',
      label: t('movement'),
      summary: [
        t(modifiers.skillId),
        modifiers.requiredManeuver && modifiers.difficulty ? t(`difficulty-${modifiers.difficulty}`) : null,
      ]
        .filter(Boolean)
        .join(' · '),
      content: setup,
    },
    {
      id: 'pace',
      label: t('pace'),
      summary: modifiers.pace ? t(modifiers.pace) : !freeMovement ? t(roundPace) : undefined,
      content: freeMovement ? freePace : normalPace,
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
    (steps[current].id === 'setup' &&
      (!modifiers.requiredManeuver || !!modifiers.difficulty) &&
      (!grappleFeatNeeded || !!modifiers.grappleFeat)) ||
    (steps[current].id === 'pace' && !blocked && (!freeMovement || !!modifiers.pace)) ||
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
