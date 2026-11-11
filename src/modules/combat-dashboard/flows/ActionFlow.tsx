import { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Alert, Button, IconButton, ListItemText, Menu, MenuItem, Stack, Tooltip } from '@mui/material';
import { FlowReviewAction, FlowStep, FlowSteps, useApiNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import { holdAction, spendActionPoint } from '../../api/action';
import { Action } from '../../api/action.dto';
import { useCombatGame, useCombatRound, useCombatActions } from '../../combat/combat-context';
import { useBusyAction } from '../../hooks/useBusyAction';
import { useOpenRounds } from '../../hooks/useOpenRounds';
import {
  actorCannotAct,
  apFreeInPhase,
  isActionActionable,
  isActionClosed,
  isResolutionBlocked,
} from '../../services/ap-service';
import { phaseNumber } from '../../services/phase-service';
import ForceResolutionDialog from '../dialogs/ForceResolutionDialog';
import { NextPendingLabelContext } from '../panel/next-pending-context';
import { useDeleteAction } from '../panel/useDeleteAction';

/**
 * A button of the flow footer. `resolves` marks the step that fixes the result (prepare an attack, resolve a maneuver
 * or a movement, complete an action): the API rejects it while the action is below its minimum AP, so it is disabled
 * then, with the reason above it.
 */
type FlowButton = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  resolves?: boolean;
  /** What is missing while the button is disabled, shown above it (workspace spec 085, 1.4). */
  disabledReason?: string;
};

/** Why the resolving step is disabled: the AP of the action against its minimum, and whether it can still reach it. */
const useBlockedReason = (action: Action): string | undefined => {
  const { t } = useTranslation();
  const openRounds = useOpenRounds();
  if (!isResolutionBlocked(action)) return undefined;
  const values = { ap: action.actionPoints ?? 0, min: action.apProfile?.min ?? 1 };
  if (action.readiness === 'unreachable')
    return `${t('resolution-unreachable-reason', values)} ${t(openRounds ? 'continues-next-round' : 'expires-at-round-end')}`;
  return t('resolution-blocked-reason', values);
};

/**
 * Frame of every action in the resolution dialog: the steps (done ones summarized, the current one open), and
 * a sticky footer with a confirmed delete, a menu of AP actions, an optional back button and the step's main button.
 * Once the action is done, the main button moves on to the next pending action.
 *
 * The AP menu (spec 011, §8.4) forces the resolution out of turn (with a reason and a note), spends an extra AP of
 * the current phase on a declared action, or holds one that has its maximum AP.
 */
const ActionFlow: FC<{
  action: Action;
  steps: FlowStep[];
  activeIndex: number;
  primary?: FlowButton;
  back?: FlowButton;
  /** A button on a reviewed done step, by its id, such as going back to edit it (workspace spec 101). */
  reviewAction?: (stepId: string) => FlowReviewAction | undefined;
  /** Called after the action is deleted (the dialog closes). */
  onDeleted: () => void;
  /** Opens the next action waiting for input, if there is one. */
  onNextPending?: () => void;
}> = ({ action, steps, activeIndex, primary, back, reviewAction, onDeleted, onNextPending }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const { game } = useCombatGame();
  const { actorRounds, roundActions } = useCombatRound();
  const { updateAction, refreshActorRounds } = useCombatActions();
  const { requestDelete, dialog } = useDeleteAction(action, onDeleted);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [forcing, setForcing] = useState(false);
  const { busy, run } = useBusyAction();
  const blockedReason = useBlockedReason(action);
  const nextPendingLabel = useContext(NextPendingLabelContext);
  const done = isActionClosed(action);
  const ended = done && action.status !== 'completed';

  const actorRound = actorRounds?.find((ar) => ar.actorId === action.actorId);
  const phase = game ? phaseNumber(game.phase) : 5;
  const currentRound = !!game && action.round === game.round && phase <= 4;
  const declared = action.status === 'declared';
  const forced = action.resolution?.mode === 'forced';
  const freeAp = actorRound && currentRound ? apFreeInPhase(actorRound, phase) : 0;
  const atMax = !!action.apProfile && (action.actionPoints ?? 0) >= action.apProfile.max;
  const canSpend = currentRound && declared && !action.freeAction && freeAp > 0;
  const canHold = currentRound && declared && atMax;
  const canForce = !done && !forced;

  // Workspace spec 083, decision 2 (§8.3): a warning, not a rule. The game master may have a reason to go out of order,
  // and the ones who tie act at the same time.
  const waitsForResolution = (each: Action) => isActionActionable(each) || each.status === 'parry';
  const initiativeOf = (actorId: string) => actorRounds?.find((ar) => ar.actorId === actorId)?.initiative?.total ?? 0;
  const faster =
    currentRound && !done && !action.reaction && waitsForResolution(action)
      ? (roundActions ?? [])
          .filter(
            (each) =>
              each.actorId !== action.actorId &&
              waitsForResolution(each) &&
              initiativeOf(each.actorId) > initiativeOf(action.actorId)
          )
          .map((each) => actorRounds?.find((ar) => ar.actorId === each.actorId))
          .filter((ar): ar is NonNullable<typeof ar> => !!ar && !actorCannotAct(ar))
          .sort((a, b) => (b.initiative?.total ?? 0) - (a.initiative?.total ?? 0))[0]
      : undefined;

  let main: FlowButton | undefined =
    done && onNextPending
      ? { label: nextPendingLabel ?? t('next-pending-action'), onClick: onNextPending }
      : done
        ? undefined
        : primary;
  if (main?.resolves && blockedReason) main = { ...main, disabled: true };

  const apCall = (request: Promise<Action>, message: string) => {
    setMenuAnchor(null);
    run(
      request.then((updated) => {
        updateAction(updated);
        // The AP ledger of the actor round changed.
        refreshActorRounds();
        notify.success(message);
      })
    );
  };

  return (
    <>
      <FlowSteps
        // Workspace spec 085, 3.6 (decision 7): every resolution flow with the steps in a bar on top
        orientation="horizontal"
        steps={steps}
        activeIndex={activeIndex}
        reviewing={reviewing}
        onReview={setReviewing}
        reviewAction={
          reviewAction &&
          ((stepId) => {
            const found = reviewAction(stepId);
            // The review closes: the flow goes on from the step it opens.
            return found && { ...found, onClick: () => (setReviewing(null), found.onClick()) };
          })
        }
        footer={
          <Stack spacing={1}>
            {ended && (
              <Alert severity="info" variant="outlined">
                {t(`action-status-${action.status}-help`)}
              </Alert>
            )}
            {faster && (
              <Alert severity="warning" variant="outlined">
                {t('initiative-order-warning', { actor: faster.actorName, initiative: faster.initiative?.total ?? 0 })}
              </Alert>
            )}
            {!done && main?.resolves && blockedReason ? (
              <Alert severity={action.readiness === 'unreachable' ? 'warning' : 'info'} variant="outlined">
                {blockedReason}
              </Alert>
            ) : (
              !done &&
              main?.disabled &&
              main.disabledReason && (
                <Alert severity="info" variant="outlined">
                  {main.disabledReason}
                </Alert>
              )
            )}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              {/* Workspace spec 085, 1.7: a closed action keeps its delete in the menu, away from the next button. */}
              {!done && (
                <Button color="error" startIcon={<DeleteIcon />} onClick={requestDelete}>
                  {t('delete')}
                </Button>
              )}
              <Tooltip title={t(done ? 'more-actions' : 'action-points-actions')}>
                <IconButton
                  aria-label={t(done ? 'more-actions' : 'action-points-actions')}
                  aria-haspopup="menu"
                  disabled={busy}
                  onClick={(e) => setMenuAnchor(e.currentTarget)}
                >
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
              <Stack direction="row" spacing={1} sx={{ flex: 1, justifyContent: 'flex-end' }}>
                {back && !done && (
                  <Button onClick={back.onClick} disabled={back.disabled}>
                    {back.label}
                  </Button>
                )}
                {main && (
                  <Button variant="contained" onClick={main.onClick} disabled={main.disabled}>
                    {main.label}
                  </Button>
                )}
              </Stack>
            </Stack>
          </Stack>
        }
      />
      <Menu anchorEl={menuAnchor} open={!!menuAnchor && done} onClose={() => setMenuAnchor(null)}>
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            requestDelete();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemText primary={t('delete-action')} secondary={t('delete-action-closed-help')} />
        </MenuItem>
      </Menu>
      <Menu anchorEl={menuAnchor} open={!!menuAnchor && !done} onClose={() => setMenuAnchor(null)}>
        <MenuItem
          disabled={!canForce}
          onClick={() => {
            setMenuAnchor(null);
            setForcing(true);
          }}
        >
          <ListItemText
            primary={t('force-resolution')}
            secondary={forced ? t('action-already-forced') : t('force-resolution-help')}
          />
        </MenuItem>
        <MenuItem disabled={!canSpend} onClick={() => apCall(spendActionPoint(action.id, auth), t('extra-ap-spent'))}>
          <ListItemText
            primary={t('spend-extra-ap')}
            secondary={currentRound ? t('free-ap-in-phase', { count: freeAp, phase }) : t('outside-action-phases')}
          />
        </MenuItem>
        <MenuItem disabled={!canHold} onClick={() => apCall(holdAction(action.id, auth), t('action-held'))}>
          <ListItemText
            primary={t('hold-action')}
            secondary={atMax ? t('hold-action-help') : t('hold-action-needs-max', { max: action.apProfile?.max ?? 0 })}
          />
        </MenuItem>
      </Menu>
      <ForceResolutionDialog action={action} open={forcing} onClose={() => setForcing(false)} />
      {dialog}
    </>
  );
};

export default ActionFlow;
