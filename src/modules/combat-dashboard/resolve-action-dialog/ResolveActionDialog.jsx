/* eslint-disable react/prop-types */
import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import ResolveAttack from './attack/ResolveAttack';
import ResolveMovement from './movement/ResolveMovement';

const ResolveActionDialog = ({ action, character, open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="xl" fullWidth>
      <DialogTitle id="alert-dialog-title">Resolve action {action.id}</DialogTitle>
      <DialogContent>
        {action.actionType === 'movement' && <ResolveMovement action={action} character={character} onClose={onClose} />}
        {action.actionType === 'attack' && <ResolveAttack action={action} character={character} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
};

export default ResolveActionDialog;
