import React, { FC, useContext, useState } from 'react';
import { Typography } from '@mui/material';
import { RmuDialog, TechnicalInfo } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { deleteAction } from '../../../api/action';
import { Action } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import MovementForm from './../movement/MovementForm';

const MovementDialog: FC<{
  action: Action;
  actorRound: ActorRound;
  open: boolean;
  onClose: () => void;
}> = ({ action, actorRound, open, onClose }) => {
  const [deleting, setDeleting] = useState(false);
  const { roundActions, setRoundActions } = useContext(CombatContext)!;
  const { showError } = useError();

  if (!actorRound || !roundActions) return <p>Loading...</p>;

  const onDelete = () => {
    if (!deleting) {
      setDeleting(true);
    } else {
      if (deleting) {
        deleteAction(action.id)
          .then(() => {
            const newActionList = roundActions.filter((e: Action) => e.id !== action.id);
            setRoundActions(newActionList);
            onClose();
          })
          .catch((err) => showError(err.message));
      }
    }
  };

  return (
    <RmuDialog
      title={actorRound.actorName}
      subtitle={t('Movement TODO')}
      avatarImg={actorRound.imageUrl}
      fullScreen={false}
      open={open}
      onClose={onClose}
      onDelete={action.status === 'completed' ? undefined : () => onDelete()}
    >
      <>
        {!deleting ? (
          <>
            <MovementForm action={action} actorRound={actorRound} onClose={onClose} />
            <TechnicalInfo>
              <pre>Action: {JSON.stringify(action, null, 2)}</pre>
            </TechnicalInfo>
          </>
        ) : (
          <Typography>Are you sure you want to delete this action?</Typography>
        )}
      </>
    </RmuDialog>
  );
};

export default MovementDialog;
