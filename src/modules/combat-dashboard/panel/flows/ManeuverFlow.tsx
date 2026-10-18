import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Box, Chip, Stack, Typography } from '@mui/material';
import {
  FlowStep,
  formatBonus,
  NumericInput,
  OpenEndedRollInput,
  RollBreakdown,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { resolveManeuver } from '../../../api/action';
import { Action, ActionManeuver } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import { useSkillService } from '../../../services/skill-service';
import SelectLightModifier from '../../../shared/selects/SelectLightModifier';
import SelectLightType from '../../../shared/selects/SelectLightType';
import ActionFlow from '../ActionFlow';
import DifficultyPicker from './DifficultyPicker';
import ResultValues from './ResultValues';

/**
 * Static or moving maneuver in the side panel: the skill and type chosen when it was declared, the modifiers
 * (difficulty, light, custom bonus), the open-ended roll, and the result with its breakdown.
 */
const ManeuverFlow: FC<{
  action: Action;
  actorRound: ActorRound;
  onDeleted: () => void;
  onNextPending?: () => void;
}> = ({ action, actorRound, onDeleted, onNextPending }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useNotify();
  const { updateAction } = useContext(CombatContext)!;
  const { getSkillBonus } = useSkillService();
  const [form, setForm] = useState<ActionManeuver>(
    () => action.maneuver ?? ({ modifiers: {}, roll: { roll: null } } as unknown as ActionManeuver)
  );
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const done = action.status === 'completed';
  const { modifiers } = form;
  const setModifiers = (change: Partial<ActionManeuver['modifiers']>) =>
    setForm((prev) => ({ ...prev, modifiers: { ...prev.modifiers, ...change } }));
  const skillId = modifiers.skillId ?? '';
  const bonus = skillId ? getSkillBonus(skillId, actorRound) : undefined;

  const resolve = () => {
    setBusy(true);
    resolveManeuver(action.id, form, auth)
      .then((result: Action) => {
        updateAction(result);
        notify.success(t('maneuver-resolved'));
      })
      .catch((err: Error) => notify.error(err))
      .finally(() => setBusy(false));
  };

  const result = action.maneuver?.result;
  const success = result?.result === 'success';
  const steps: FlowStep[] = [
    {
      id: 'skill',
      label: t('maneuver'),
      summary: [
        `${t(skillId)} ${bonus === undefined ? '' : formatBonus(bonus)}`.trim(),
        t(modifiers.maneuverType ?? ''),
        action.freeAction ? t('free') : null,
      ]
        .filter(Boolean)
        .join(' · '),
    },
    {
      id: 'modifiers',
      label: t('modifiers'),
      summary: [
        modifiers.difficulty ? t(`difficulty-${modifiers.difficulty}`) : null,
        modifiers.customBonus ? formatBonus(modifiers.customBonus) : null,
      ]
        .filter(Boolean)
        .join(' · '),
      content: (
        <Stack spacing={2}>
          <DifficultyPicker value={modifiers.difficulty} onChange={(difficulty) => setModifiers({ difficulty })} />
          <SelectLightModifier
            value={modifiers.lightModifier ?? ''}
            onChange={(lightModifier) => setModifiers({ lightModifier })}
          />
          {modifiers.lightModifier && modifiers.lightModifier !== 'none' && (
            <SelectLightType
              value={modifiers.light ?? ''}
              lightModifier={modifiers.lightModifier}
              onChange={(light) => setModifiers({ light })}
            />
          )}
          <Box sx={{ maxWidth: 200 }}>
            <NumericInput
              label={t('custom-modifier')}
              value={modifiers.customBonus}
              onChange={(customBonus) => setModifiers({ customBonus })}
              integer
            />
          </Box>
        </Stack>
      ),
    },
    {
      id: 'roll',
      label: t('roll'),
      summary: action.maneuver?.roll?.roll ?? form.roll?.roll ?? undefined,
      content: (
        <OpenEndedRollInput
          inputGridSize={6}
          label={t('maneuver-roll')}
          value={form.roll?.roll ?? null}
          onChange={(roll) => setForm((prev) => ({ ...prev, roll: { ...(prev.roll ?? {}), roll } }))}
        />
      ),
    },
    {
      id: 'result',
      label: t('result'),
      content: result && (
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Chip label={t(result.result)} color={success ? 'success' : 'error'} />
            {action.maneuver?.roll?.totalRoll !== undefined && (
              <Typography variant="body2" color="text.secondary">
                {t('total-value', { value: action.maneuver.roll.totalRoll })}
              </Typography>
            )}
          </Stack>
          {result.message && <Typography variant="body2">{result.message}</Typography>}
          <ResultValues values={[{ label: t('fatigue'), value: action.fatigue || 0 }]} />
          {action.maneuver?.roll?.modifiers && <RollBreakdown modifiers={action.maneuver.roll.modifiers} />}
        </Stack>
      ),
    },
  ];

  const current = done ? 3 : step;
  return (
    <ActionFlow
      action={action}
      steps={steps}
      activeIndex={current}
      primary={
        done
          ? undefined
          : current === 1
            ? { label: t('next'), disabled: !modifiers.difficulty, onClick: () => setStep(2) }
            : { label: t('resolve'), disabled: !form.roll?.roll || busy, onClick: resolve }
      }
      back={current === 2 ? { label: t('back'), onClick: () => setStep(1) } : undefined}
      onDeleted={onDeleted}
      onNextPending={onNextPending}
    />
  );
};

export default ManeuverFlow;
