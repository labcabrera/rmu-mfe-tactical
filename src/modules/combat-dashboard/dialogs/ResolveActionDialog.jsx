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

const ResolveActionDialog = ({ action, character, open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="xl">
      <DialogTitle id="alert-dialog-title">Resolve action</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <pre>{JSON.stringify(action, null, 2)}</pre>
          </Grid>
          <Grid item xs={6}>
            <pre>{JSON.stringify(character, null, 2)}</pre>
          </Grid>
        </Grid>
        {action.actionType === 'movement' && <ResolveActionDialogMovement action={action} />}
      </DialogContent>
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
