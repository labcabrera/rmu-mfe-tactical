import React, { FC, useContext, useState } from 'react';
import { Button, DialogActions, Slide, Stack, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { TransitionProps } from '@mui/material/transitions';
import { DeleteDialog, RmuDialog, TechnicalInfo } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { CombatContext } from '../../../CombatContext';
import { useError } from '../../../ErrorContext';
import { deleteAction } from '../../api/action';
import { Action } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';
import ActorRoundAvatar from '../../shared/avatars/ActorRoundAvatar';
import ActionManeuverForm from './maneuver/ActionManeuverForm';
import MeleeAttackForm from './melee-attack/MeleeAttackForm';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ActionDialog: FC<{
  action: Action;
  actorRound: ActorRound;
  open: boolean;
  onClose: () => void;
}> = ({ action, actorRound, open, onClose }) => {
  const [deleting, setDeleting] = useState(false);
  const { roundActions, setRoundActions } = useContext(CombatContext)!;
  const { showError } = useError();

  if (!actorRound) return <p>Loading...</p>;

  const confirmDelete = () => {
    if (!roundActions) return null;
    deleteAction(action.id)
      .then(() => {
        const newActionList = roundActions.filter((e: Action) => e.id !== action.id);
        setRoundActions(newActionList);
        onClose();
      })
      .catch((err) => showError(err.message));
  };

  return (
    <>
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
                <pre>Action: {JSON.stringify(action, null, 2)}</pre>
              </TechnicalInfo>
            </>
          ) : (
            <DeleteDialog
              message={'Are you sure you want to delete this action?'}
              open={true}
              onDelete={() => confirmDelete()}
              onClose={() => setDeleting(false)}
            />
          )}
        </>
      </RmuDialog>
      <Dialog
        open={false}
        fullScreen={action.actionType === 'melee_attack'}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xl"
        fullWidth
        slots={{ transition: Transition }}
      >
        <DialogTitle id="alert-dialog-title">
          <Stack direction="row" spacing={2} alignItems="center">
            <ActorRoundAvatar actorRound={actorRound} size={100} variant="square" />
            <Stack direction="column">
              <Typography variant="h6">{actorRound.actorName}</Typography>
              <Typography variant="subtitle1">{t(action.actionType)}</Typography>
            </Stack>
          </Stack>
        </DialogTitle>
        {!deleting ? (
          <DialogContent sx={{ minHeight: '800px' }}>
            {action.actionType === 'maneuver' && <ActionManeuverForm action={action} actorRound={actorRound} />}
          </DialogContent>
        ) : (
          <DialogContent>
            <p>{t('Are you sure you want to delete this action?')}</p>
          </DialogContent>
        )}
        <DialogActions>
          {!deleting ? (
            <>
              <Button onClick={() => setDeleting(true)} color="primary">
                {t('Delete')}
              </Button>
              <Button onClick={onClose} color="primary">
                {t('Close')}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={confirmDelete} color="error">
                {t('Confirm')}
              </Button>
              <Button onClick={() => setDeleting(false)} color="primary">
                {t('Cancel')}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ActionDialog;
