import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Action } from '../../api/actions';
import { ActorRound } from '../../api/actor-rounds';
import { Character } from '../../api/characters';
import ResolveAttack from './attack/ResolveAttack';
import ResolveMovement from './movement/ResolveMovement';

const ResolveActionDialog: FC<{
  action: Action;
  actorRound: ActorRound;
  character: Character;
  open: boolean;
  onClose: () => void;
}> = ({ action, actorRound, character, open, onClose }) => {
  const { t } = useTranslation();

  if (!actorRound) return <p>Loading...</p>;

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="xl" fullWidth>
      <DialogTitle id="alert-dialog-title">Resolve {t(action.actionType)}</DialogTitle>
      <DialogContent>
        {action.actionType === 'movement' && <ResolveMovement action={action} character={character} onClose={onClose} />}
        {action.actionType === 'attack' && <ResolveAttack action={action} actorRound={actorRound} character={character} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
};

export default ResolveActionDialog;
