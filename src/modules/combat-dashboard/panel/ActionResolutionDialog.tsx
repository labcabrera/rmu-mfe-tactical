import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { combatActionInfo, RmuDialog } from '@labcabrera-rmu/rmu-react-shared-lib';
import { Action } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';
import ActionResolutionFlow from './ActionResolutionFlow';

/**
 * Resolution of an action in a large dialog (full screen on phones): the action's guided flow, whose forms
 * need more room than the side panel has. Esc, the backdrop and "Close" close it.
 */
const ActionResolutionDialog: FC<{
  action: Action | undefined;
  actorRound: ActorRound | undefined;
  onClose: () => void;
  onDeleted: () => void;
  onNextPending?: () => void;
}> = ({ action, actorRound, onClose, onDeleted, onNextPending }) => {
  const { t } = useTranslation();
  const open = Boolean(action && actorRound);
  return (
    <RmuDialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      title={actorRound?.actorName ?? ''}
      subtitle={
        action
          ? `${t(combatActionInfo(action.actionType).labelKey)} · ${t(`action-status-${action.status}`)}`
          : undefined
      }
      // The same size for every action type, whatever its form holds; wide, so that the attack modifiers
      // fit in view.
      paperSx={{ height: { md: 'min(88vh, 960px)' }, maxWidth: { md: 'min(96vw, 1800px)' } }}
    >
      {action && actorRound && (
        <ActionResolutionFlow
          key={action.id}
          action={action}
          actorRound={actorRound}
          onDeleted={onDeleted}
          onNextPending={onNextPending}
        />
      )}
    </RmuDialog>
  );
};

export default ActionResolutionDialog;
