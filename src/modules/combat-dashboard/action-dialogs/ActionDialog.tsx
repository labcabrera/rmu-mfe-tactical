import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { DeleteDialog, RmuDialog, TechnicalInfo, useNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { deleteAction } from '../../api/action';
import { Action } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';
import ActionManeuverForm from './maneuver/ActionManeuverForm';

const ActionDialog: FC<{
  action: Action;
  actorRound: ActorRound;
  open: boolean;
  onClose: () => void;
}> = ({ action, actorRound, open, onClose }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);
  const { roundActions, setRoundActions } = useContext(CombatContext)!;
  const notify = useNotify();

  if (!actorRound) return null;

  const confirmDelete = () => {
    if (!roundActions) return null;
    deleteAction(action.id, auth)
      .then(() => {
        const newActionList = roundActions.filter((e: Action) => e.id !== action.id);
        setRoundActions(newActionList);
        onClose();
      })
      .catch((err) => notify.error(err));
  };

  return (
    <RmuDialog
      title={actorRound.actorName}
      subtitle={t(action.actionType)}
      avatarImg={actorRound.imageUrl}
      fullScreen={true}
      open={open}
      onClose={onClose}
      onDelete={action.status === 'completed' ? undefined : () => setDeleting(true)}
    >
      <>
        {!deleting ? (
          <>
            {action.actionType === 'maneuver' && <ActionManeuverForm action={action} actorRound={actorRound} />}
            <TechnicalInfo>
              <pre>{JSON.stringify(action, null, 2)}</pre>
            </TechnicalInfo>
          </>
        ) : (
          <DeleteDialog
            message={t('delete-action-confirmation')}
            open={true}
            onDelete={() => confirmDelete()}
            onClose={() => setDeleting(false)}
          />
        )}
      </>
    </RmuDialog>
  );
};

export default ActionDialog;
