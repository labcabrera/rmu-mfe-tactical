import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { alpha, Box, ButtonBase, Chip, FormControlLabel, Stack, Switch, Typography } from '@mui/material';
import {
  DifficultyPicker,
  FlowStep,
  formatBonus,
  NumericInput,
  OPEN_D100,
  RollField,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { resolveMovement } from '../../../api/action';
import { Action, ActionMovement, MOVEMENT_LIGHT_OPTIONS, MOVEMENT_TABLE } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import { isActionClosed } from '../../../services/ap-service';
import { useTacticalNotify } from '../../../services/notify-service';
import { useSkillService } from '../../../services/skill-service';
import OptionTiles from '../../action-dialogs/attack-modifiers/pickers/OptionTiles';
import ActionFlow from '../ActionFlow';
import { MovementResult } from './ActionResults';
import { rememberedLight, rememberLight } from './maneuver/maneuver-form';
import { useSkillDifficultyGuide } from './useSkillDifficultyGuide';

const MOVEMENT_SKILLS = ['running', 'swimming', 'climbing', 'flying'];

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
  const { strategicGame, updateAction, refreshActorRounds } = useContext(CombatContext)!;
  const { getSkillBonus } = useSkillService();
  const [form, setForm] = useState<ActionMovement>(() =>
    initialForm(action, actorRound, rememberedLight(action.gameId))
  );
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  // Completed, or ended without being resolved (interrupted, expired, carried to the next round).
  const done = isActionClosed(action);
  const { modifiers } = form;
  const setModifiers = (change: Partial<ActionMovement['modifiers']>) =>
    setForm((prev) => ({ ...prev, modifiers: { ...prev.modifiers, ...change } }));

  // The distance of each pace is per AP: the API counts the AP of the movement in its ledger.
  const actionPoints = Math.max(1, action.actionPoints ?? 1);
  const scale = strategicGame?.options?.boardScaleMultiplier || 1;
  const maxPaceIndex = MOVEMENT_TABLE.findIndex((p) => p.id === actorRound.movement.maxPace);
  const skillBonus = (skillId: string) => getSkillBonus(skillId, actorRound);
  const guide = useSkillDifficultyGuide(modifiers.requiredManeuver ? modifiers.skillId : null);
  const distance = (multiplier: number) => actorRound.movement.bmr * multiplier * actionPoints;

  const resolve = () => {
    setBusy(true);
    resolveMovement(action.id, form, auth)
      .then((result: Action) => {
        updateAction(result);
        refreshActorRounds();
        notify.success(t('movement-resolved'));
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  const setup = (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
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
      </Stack>
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
            minTileWidth={110}
          />
          <Box sx={{ maxWidth: 200 }}>
            <NumericInput
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

  const pace = (
    <Stack spacing={0.75} role="radiogroup" aria-label={t('pace')}>
      {MOVEMENT_TABLE.map((row, index) => {
        const overMax = index > maxPaceIndex;
        const selected = modifiers.pace === row.id;
        const feet = distance(row.multiplier);
        return (
          <ButtonBase
            key={row.id}
            role="radio"
            aria-checked={selected}
            disabled={overMax}
            onClick={() => setModifiers({ pace: row.id })}
            sx={(theme) => ({
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              alignItems: 'center',
              textAlign: 'left',
              px: 1.5,
              py: 1,
              borderRadius: `${theme.radius.sm}px`,
              border: 1,
              borderColor: selected ? 'primary.main' : 'divider',
              bgcolor: selected ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
              opacity: overMax ? 0.55 : 1,
            })}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {t(row.id)}{' '}
                <Typography component="span" variant="caption" color="text.secondary">
                  {row.label}
                </Typography>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {overMax ? t('over-max-pace') : row.penalty !== '-' ? row.penalty : ' '}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
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
      summary: modifiers.pace ? t(modifiers.pace) : undefined,
      content: pace,
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
    (steps[current].id === 'setup' && (!modifiers.requiredManeuver || !!modifiers.difficulty)) ||
    (steps[current].id === 'pace' && !!modifiers.pace) ||
    (steps[current].id === 'roll' && form.roll?.roll !== null && form.roll?.roll !== undefined);

  return (
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
  );
};

export default MovementFlow;
