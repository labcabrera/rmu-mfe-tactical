/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useError } from '../../ErrorContext';
import { declareActorRoundInitiative } from '../api/actor-rounds';

const DeclareInitiativeDialog = ({ actorRound, open, setOpen }) => {
  const { showError } = useError();

  const [formData, setFormData] = useState({
    roll: 0,
  });

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    declareActorRoundInitiative(actorRound.id, formData.roll)
      .then((updatedActorRound) => {
        //setActorRound(updatedActorRound);
        //TODO
        console.log('updatedActorRound', updatedActorRound);
        setOpen(false);
      })
      .catch((error) => {
        showError(error);
      });
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Declare actor round initiative</DialogTitle>
        <DialogContent>
          <DialogContentText>TODO</DialogContentText>
          <TextField autoFocus required id="roll" name="roll" label="initiative-roll" fullWidth variant="standard" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={() => handleSubmit()}>Declare</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeclareInitiativeDialog;
