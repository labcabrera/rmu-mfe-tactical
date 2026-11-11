import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, Stack } from '@mui/material';
import { ActionStateMarker, RmuDialog } from '@labcabrera-rmu/rmu-react-shared-lib';
import { Action } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';
import { useCombatRound } from '../../combat/combat-context';
import { useOpenRounds } from '../../hooks/useOpenRounds';
import { actionLabel, actionResult, actionState, actionStateTooltip } from '../board/action-view';
import ActionResolutionFlow from '../flows/ActionResolutionFlow';
import { NextPendingLabelContext } from '../panel/next-pending-context';

/**
 * Resolution of an action in a large dialog (full screen on phones): the action's guided flow, whose forms
 * need more room than the side panel has. Esc, the backdrop and the ✕ of the title close it; the flow has the only
 * footer (workspace spec 085, 1.1). The subtitle names the action and its targets, with the same status marker as
 * the side panel (1.6).
 */
const ActionResolutionDialog: FC<{
  action: Action | undefined;
  actorRound: ActorRound | undefined;
  onClose: () => void;
  onDeleted: () => void;
  onNextPending?: () => void;
  /** Name of the action that `onNextPending` opens. */
  nextPendingLabel?: string;
}> = ({ action, actorRound, onClose, onDeleted, onNextPending, nextPendingLabel }) => {
  const { t } = useTranslation();
  const { actorRounds } = useCombatRound();
  const openRounds = useOpenRounds();
  const open = Boolean(action && actorRound);
  // Workspace spec 085, decision 5: in the parry step the defenders decide, not the attacker
  const deciders =
    action?.status === 'parry'
      ? [
          ...new Set(
            (action.parries ?? [])
              .filter((p) => !p.carriedOver)
              .map((p) => actorRounds?.find((ar) => ar.actorId === p.actorId)?.actorName ?? '')
              .concat(
                (action.attacks ?? [])
                  .filter(
                    (attack) =>
                      attack.shieldManeuver?.required &&
                      (attack.shieldManeuver.passed === null || attack.shieldManeuver.passed === undefined)
                  )
                  .map((attack) => actorRounds?.find((ar) => ar.actorId === attack.modifiers.targetId)?.actorName ?? '')
              )
              .filter(Boolean)
          ),
        ]
      : [];
  return (
    <RmuDialog
      open={open}
      onDismiss={onClose}
      closeIcon
      hideActions
      // Workspace spec 085, 3.6: the flow lays out its own edges, with its step bar flush at the top
      disableContentPadding
      maxWidth="xl"
      title={actorRound?.actorName ?? ''}
      subtitle={
        action ? (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5 }}>
            <Box component="span">{actionLabel(action, t, actorRounds)}</Box>
            {deciders.length > 0 && (
              <Chip
                size="small"
                color="warning"
                variant="outlined"
                label={t('decides', { actors: deciders.join(', ') })}
              />
            )}
            <ActionStateMarker
              state={actionState(action)}
              text={actionResult(action, t) ?? t(`action-status-${action.status}`)}
              tooltip={actionStateTooltip(action, t, openRounds)}
            />
          </Stack>
        ) : undefined
      }
      // The same size for every action type, whatever its form holds; wide, so that the attack modifiers
      // fit in view.
      paperSx={{ height: { md: 'min(88vh, 960px)' }, maxWidth: { md: 'min(96vw, 1800px)' } }}
    >
      {action && actorRound && (
        <NextPendingLabelContext.Provider value={nextPendingLabel}>
          <ActionResolutionFlow
            key={action.id}
            action={action}
            actorRound={actorRound}
            onDeleted={onDeleted}
            onNextPending={onNextPending}
          />
        </NextPendingLabelContext.Provider>
      )}
    </RmuDialog>
  );
};

export default ActionResolutionDialog;
