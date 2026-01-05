import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

type DeleteDialogProps = {
  message: string;
  open: boolean;
  onDelete: () => void;
  onClose: () => void;
};

const DeleteDialog: React.FC<DeleteDialogProps> = ({ message, open, onDelete, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{'Faction delete confirmation'}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onDelete}>Delete</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
