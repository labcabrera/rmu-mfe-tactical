import React from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Action } from '../../api/actions';
import { Character } from '../../api/characters';
import ResolveAttack from './attack/ResolveAttack';
import ResolveMovement from './movement/ResolveMovement';

type ResolveActionDialogProps = {
  action: Action;
  character: Character;
  open: boolean;
  onClose: () => void;
};

const ResolveActionDialog: React.FC<ResolveActionDialogProps> = ({ action, character, open, onClose }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="xl" fullWidth>
      <DialogTitle id="alert-dialog-title">Resolve {t(action.actionType)}</DialogTitle>
      <DialogContent>
        {action.actionType === 'movement' && <ResolveMovement action={action} character={character} onClose={onClose} />}
        {action.actionType === 'attack' && <ResolveAttack action={action} character={character} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
};

export default ResolveActionDialog;
