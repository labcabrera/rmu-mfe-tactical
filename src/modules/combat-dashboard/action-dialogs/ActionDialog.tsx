import React, { FC, useContext, useState } from 'react';
import { Button, DialogActions } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { t } from 'i18next';
import { CombatContext } from '../../../CombatContext';
import { useError } from '../../../ErrorContext';
import { deleteAction } from '../../api/action';
import { Action } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';
import { Character } from '../../api/characters';
import ActionAttack from './attack/ActionAttack';
import ActionManeuverForm from './maneuver/ActionManeuverForm';
import ActionMovement from './movement/ActionMovement';
import RangedAttack from './ranged-attack/RangedAttack';

const ActionDialog: FC<{
  action: Action;
  actorRound: ActorRound;
  character: Character;
  open: boolean;
  onClose: () => void;
}> = ({ action, actorRound, character, open, onClose }) => {
  const [deleting, setDeleting] = useState(false);
  const { roundActions, setRoundActions } = useContext(CombatContext)!;
  const { showError } = useError();

  if (!actorRound) return <p>Loading...</p>;

  const confirmDelete = () => {
    deleteAction(action.id)
      .then(() => {
        const newActionList = roundActions.filter((e: Action) => e.id !== action.id);
        setRoundActions(newActionList);
        onClose();
      })
      .catch((err) => showError(err.message));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="xl"
      fullWidth
    >
      <DialogTitle id="alert-dialog-title">
        {actorRound.actorName} {t(action.actionType)}
      </DialogTitle>
      {!deleting ? (
        <DialogContent>
          {action.actionType === 'movement' && (
            <ActionMovement action={action} character={character} onClose={onClose} />
          )}
          {action.actionType === 'melee_attack' && (
            <ActionAttack action={action} actorRound={actorRound} character={character} />
          )}
          {action.actionType === 'ranged_attack' && (
            <RangedAttack action={action} actorRound={actorRound} character={character} />
          )}
          {action.actionType === 'maneuver' && (
            <ActionManeuverForm action={action} actorRound={actorRound} character={character} />
          )}
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
  );
};

export default ActionDialog;
