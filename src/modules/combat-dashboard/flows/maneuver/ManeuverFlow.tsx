import { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Button, Stack } from '@mui/material';
import {
  apiErrorCode,
  FALL_CONTROL_PURPOSE,
  FlowStep,
  formatBonus,
  LoadingState,
  OPEN_D100,
  RollBreakdown,
  RollField,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useQuery } from '@tanstack/react-query';
import { fetchActionManeuverModifiers, resolveManeuver } from '../../../api/action';
import { Action, ManeuverListingQuery, ManeuverModifiersListing } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import { useCombatGame, useCombatRound, useCombatActions } from '../../../combat/combat-context';
import { useBusyAction } from '../../../hooks/useBusyAction';
import { useSkillService } from '../../../hooks/useSkillService';
import { isActionClosed } from '../../../services/ap-service';
import {
  actorOpenEnded,
  combatTalentPurposes,
  isFallControlAction,
  rememberedPurpose,
} from '../../../services/combat-talents-service';
import UnresolvedMovementNotice from '../../../shared/movement/UnresolvedMovementNotice';
import ActionFlow from '../ActionFlow';
import { ManeuverResult } from '../ActionResults';
import { blockBPurposes } from './BlockBPurposeFields';
import ManeuverModifiersStep from './ManeuverModifiersStep';
import {
  combatTalentReady,
  featOfStrengthReady,
  initialForm,
  listingQuery,
  ManeuverForm,
  passiveSideReady,
  predictedModifiers,
  predictedSkipped,
  rememberedLight,
  rememberLight,
  toResolveRequest,
} from './maneuver-form';

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
  const notify = useApiNotify();
  const { gameId } = useCombatGame();
  const { actorRounds } = useCombatRound();
  const { updateAction, refreshActorRounds } = useCombatActions();
  const targets = (actorRounds ?? []).filter((each) => each.actorId !== actorRound.actorId);
  const { getSkillBonus } = useSkillService();
  // Completed, or ended without being resolved (interrupted, expired, carried to the next round).
  const done = isActionClosed(action);
  const [listing, setListing] = useState<ManeuverModifiersListing | null>(null);
  const [form, setForm] = useState<ManeuverForm>(() =>
    initialForm(action.maneuver, null, rememberedLight(gameId ?? action.gameId))
  );
  const [step, setStep] = useState(1);
  const { busy, run } = useBusyAction();
  const skillId = action.maneuver?.modifiers.skillId ?? '';
  // Workspace spec 076: a combat talent maneuver declared from the palette starts with its purpose chosen
  const remembered = rememberedPurpose(action.id);
  // Workspace spec 077: "Fall control" from the palette resolves with its purpose (Acrobatics, absolute, instantaneous)
  // Workspace spec 079: a Fortitude maneuver is always one (it is declared instantaneous from the palette)
  const declaredPurpose = isFallControlAction(action)
    ? FALL_CONTROL_PURPOSE
    : remembered && combatTalentPurposes(actorRound, skillId).includes(remembered)
      ? remembered
      : blockBPurposes(skillId)[0] === 'fortitude'
        ? 'fortitude'
        : null;

  // The choices of the listing asked for: at first the stored ones and the declared purpose (workspace spec 079).
  // The flow is mounted per action (`key={action.id}` in ActionResolutionDialog).
  const [choices, setChoices] = useState<ManeuverListingQuery>(() =>
    listingQuery(initialForm(action.maneuver, null, null, declaredPurpose))
  );
  const listingRequest = useQuery({
    queryKey: ['maneuver-flow', 'listing', action.id, choices],
    queryFn: () => fetchActionManeuverModifiers(action.id, auth, undefined, undefined, choices),
    enabled: !done,
    gcTime: 0,
  });

  // Kept in local state: a listing stays on screen while the next one loads or if it fails.
  const seeded = useRef(false);
  useEffect(() => {
    const data = listingRequest.data;
    if (!data) return;
    setListing(data);
    if (seeded.current) return;
    seeded.current = true;
    // Defaults from the listing, keeping what was already chosen.
    setForm((prev) => ({
      ...initialForm(action.maneuver, data, rememberedLight(gameId ?? action.gameId), declaredPurpose),
      ...(prev.roll !== null ? { roll: prev.roll, unmodified: prev.unmodified, dice: prev.dice } : {}),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingRequest.data]);

  // The first read shows its error in place, with a retry; a later one, once there is a listing, as a notification.
  const failure = listingRequest.error;
  const failureCode = failure && !listing ? apiErrorCode(failure) : null;
  const listingError =
    failure && !listing
      ? failureCode && i18n.exists(failureCode)
        ? t(failureCode)
        : failure.message || t('error')
      : null;
  useEffect(() => {
    if (failure && listing) notify.error(failure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [failure]);

  // Workspace spec 079, block B: the purpose, the aids and the load change the listing (its `aids` and the difficulty
  // of a feat of strength). Read it again a moment after they change, keeping the form.
  const query = JSON.stringify(listingQuery(form));
  useEffect(() => {
    if (done || !listing || JSON.stringify(choices) === query) return undefined;
    const timer = setTimeout(() => setChoices(listingQuery(form)), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, done, listing === null]);

  const change = (patch: Partial<ManeuverForm>) => {
    if ('light' in patch) rememberLight(gameId ?? action.gameId, patch.light ?? null);
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const resolve = () => {
    if (!listing || form.roll === null) return;
    run(
      resolveManeuver(action.id, toResolveRequest(listing, form), auth).then((result: Action) => {
        updateAction(result);
        // A movement maneuver may add a critical alert to the actor.
        refreshActorRounds();
        notify.success(t('maneuver-resolved'));
      })
    );
  };

  const bonus =
    listing?.skill.bonus ??
    (skillId ? getSkillBonus(skillId, actorRound, action.maneuver?.modifiers.specialization) : undefined);
  const stored = action.maneuver?.modifiers;
  const specialization = listing?.skill.specialization ?? stored?.specialization;
  const type = done ? stored?.maneuverType : form.maneuverType;
  const difficulty = done ? stored?.difficulty : form.difficulty;
  const customBonus = done ? stored?.customBonus : form.customBonus;
  const predicted = listing ? predictedModifiers(listing, form, actorRound) : [];

  const modifiersContent = listingError ? (
    <Alert
      severity="error"
      action={
        <Button color="inherit" size="small" onClick={() => listingRequest.refetch()}>
          {t('retry')}
        </Button>
      }
    >
      {listingError}
    </Alert>
  ) : listing ? (
    <ManeuverModifiersStep listing={listing} form={form} onChange={change} targets={targets} actorRound={actorRound} />
  ) : (
    <LoadingState variant="inline" />
  );

  const steps: FlowStep[] = [
    {
      id: 'skill',
      label: t('maneuver'),
      summary: [
        `${t(skillId, { defaultValue: skillId })}${specialization ? ` (${t(specialization, { defaultValue: specialization })})` : ''} ${bonus === undefined ? '' : formatBonus(bonus)}`.trim(),
        type ? t(type) : null,
        (done ? stored?.purpose : form.purpose) ? t((done ? stored?.purpose : form.purpose) as string) : null,
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
      content: (
        <Stack spacing={1.5}>
          <UnresolvedMovementNotice action={action} />
          {modifiersContent}
        </Stack>
      ),
    },
    {
      id: 'roll',
      label: t('roll'),
      summary: action.maneuver?.roll?.roll ?? form.roll ?? undefined,
      content: (
        <Stack spacing={2}>
          <RollField
            spec={OPEN_D100}
            label={t('maneuver-roll')}
            value={form.roll}
            onChange={(roll) => change({ roll: roll.total, unmodified: roll.unmodified, dice: roll.rolls })}
            // Workspace spec 076: the API checks the dice against the actor's roll profile (luck talents)
            openEnded={actorOpenEnded(actorRound)}
          />
          {listing && (
            <RollBreakdown
              context="maneuver"
              modifiers={predicted}
              skipped={predictedSkipped(listing, form)}
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
            ? {
                label: t('next'),
                disabled:
                  !listing || !form.difficulty || !combatTalentReady(form) || !featOfStrengthReady(listing, form),
                onClick: () => setStep(2),
              }
            : {
                label: t('resolve'),
                disabled:
                  !listing ||
                  form.roll === null ||
                  !passiveSideReady(listing, form) ||
                  !combatTalentReady(form) ||
                  !featOfStrengthReady(listing, form) ||
                  busy,
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
