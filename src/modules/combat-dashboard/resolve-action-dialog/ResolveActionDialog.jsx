/* eslint-disable react/prop-types */
import React from 'react';
import { Grid } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ResolveActionDialogMovement from './ResolveActionDialogMovement';

const ResolveActionDialog = ({ action, actorRound, character, open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="xl" fullWidth>
      <DialogTitle id="alert-dialog-title">Resolve action</DialogTitle>
      <DialogContent>{action.actionType === 'movement' && <ResolveActionDialogMovement action={action} character={character} />}</DialogContent>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">Resolve action {action.id} dialog</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Cancel</Button>
        {/* <Button onClick={() => onDelete()}>Resolve</Button> */}
      </DialogActions>
    </Dialog>
  );
};

export default ResolveActionDialog;
