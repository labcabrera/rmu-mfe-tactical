import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Button, CircularProgress, Stack } from '@mui/material';
import { FlowStep, formatBonus, OpenEndedRollInput, RollBreakdown } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { fetchActionManeuverModifiers, resolveManeuver } from '../../../api/action';
import { Action, ManeuverModifiersListing } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import { isActionClosed } from '../../../services/ap-service';
import { apiErrorCode, useTacticalNotify } from '../../../services/notify-service';
import { useSkillService } from '../../../services/skill-service';
import ActionFlow from '../ActionFlow';
import { ManeuverResult } from './ActionResults';
import {
  initialForm,
  ManeuverForm,
  predictedModifiers,
  rememberedLight,
  rememberLight,
  toResolveRequest,
} from './maneuver/maneuver-form';
import ManeuverModifiersStep from './maneuver/ManeuverModifiersStep';

/**
 * Static or moving maneuver in the side panel (spec 010 §6): the skill chosen when it was declared, the modifiers
 * drawn from the API's listing (base modifiers, difficulty, light, the skill's own modifiers, conflict and custom
 * bonus) with the predicted total, the open-ended roll (with its first die) and the result with its breakdown.
 */
const ManeuverFlow: FC<{
  action: Action;
  actorRound: ActorRound;
  onDeleted: () => void;
  onNextPending?: () => void;
}> = ({ action, actorRound, onDeleted, onNextPending }) => {
  const { t, i18n } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const { gameId, updateAction, refreshActorRounds } = useContext(CombatContext)!;
  const { getSkillBonus } = useSkillService();
  // Completed, or ended without being resolved (interrupted, expired, carried to the next round).
  const done = isActionClosed(action);
  const [listing, setListing] = useState<ManeuverModifiersListing | null>(null);
  const [listingError, setListingError] = useState<string | null>(null);
  const [form, setForm] = useState<ManeuverForm>(() =>
    initialForm(action.maneuver, null, rememberedLight(gameId ?? action.gameId))
  );
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const skillId = action.maneuver?.modifiers.skillId ?? '';

  const loadListing = () => {
    setListingError(null);
    fetchActionManeuverModifiers(action.id, auth)
      .then((data) => {
        setListing(data);
        // Defaults from the listing, keeping what was already chosen.
        setForm((prev) => ({
          ...initialForm(action.maneuver, data, rememberedLight(gameId ?? action.gameId)),
          ...(prev.roll !== null ? { roll: prev.roll, unmodified: prev.unmodified } : {}),
        }));
      })
      .catch((err) => {
        const code = apiErrorCode(err);
        setListingError(code && i18n.exists(code) ? t(code) : (err as Error)?.message || t('error'));
      });
  };

  useEffect(() => {
    if (!done) loadListing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action.id, done]);

  const change = (patch: Partial<ManeuverForm>) => {
    if ('light' in patch) rememberLight(gameId ?? action.gameId, patch.light ?? null);
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const resolve = () => {
    if (!listing || form.roll === null) return;
    setBusy(true);
    resolveManeuver(action.id, toResolveRequest(listing, form), auth)
      .then((result: Action) => {
        updateAction(result);
        // A movement maneuver may add a critical alert to the actor.
        refreshActorRounds();
        notify.success(t('maneuver-resolved'));
      })
      .catch((err: Error) => notify.error(err))
      .finally(() => setBusy(false));
  };

  const bonus = listing?.skill.bonus ?? (skillId ? getSkillBonus(skillId, actorRound) : undefined);
  const stored = action.maneuver?.modifiers;
  const type = done ? stored?.maneuverType : form.maneuverType;
  const difficulty = done ? stored?.difficulty : form.difficulty;
  const customBonus = done ? stored?.customBonus : form.customBonus;
  const predicted = listing ? predictedModifiers(listing, form) : [];

  const modifiersContent = listingError ? (
    <Alert
      severity="error"
      action={
        <Button color="inherit" size="small" onClick={loadListing}>
          {t('retry')}
        </Button>
      }
    >
      {listingError}
    </Alert>
  ) : listing ? (
    <ManeuverModifiersStep listing={listing} form={form} onChange={change} />
  ) : (
    <CircularProgress size={24} />
  );

  const steps: FlowStep[] = [
    {
      id: 'skill',
      label: t('maneuver'),
      summary: [
        `${t(skillId, { defaultValue: skillId })} ${bonus === undefined ? '' : formatBonus(bonus)}`.trim(),
        type ? t(type) : null,
        action.maneuver?.continuesActionId ? t('continued-maneuver') : null,
        action.freeAction ? t('free') : null,
      ]
        .filter(Boolean)
        .join(' · '),
    },
    {
      id: 'modifiers',
      label: t('modifiers'),
      summary: [difficulty ? t(`difficulty-${difficulty}`) : null, customBonus ? formatBonus(customBonus) : null]
        .filter(Boolean)
        .join(' · '),
      content: modifiersContent,
    },
    {
      id: 'roll',
      label: t('roll'),
      summary: action.maneuver?.roll?.roll ?? form.roll ?? undefined,
      content: (
        <Stack spacing={2}>
          <OpenEndedRollInput
            inputGridSize={6}
            label={t('maneuver-roll')}
            value={form.roll}
            onChange={(roll, details) => change({ roll, unmodified: details?.unmodified ?? null })}
          />
          {listing && (
            <RollBreakdown
              modifiers={predicted}
              roll={form.roll}
              totalLabel={form.roll === null ? t('predicted-total') : t('total')}
            />
          )}
        </Stack>
      ),
    },
    {
      id: 'result',
      label: t('result'),
      content: <ManeuverResult action={action} />,
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
            ? { label: t('next'), disabled: !listing || !form.difficulty, onClick: () => setStep(2) }
            : {
                label: t('resolve'),
                disabled: !listing || form.roll === null || busy,
                onClick: resolve,
                resolves: true,
              }
      }
      back={current === 2 ? { label: t('back'), onClick: () => setStep(1) } : undefined}
      onDeleted={onDeleted}
      onNextPending={onNextPending}
    />
  );
};

export default ManeuverFlow;
