/* eslint-disable react/prop-types */
import React, { useState, useContext } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { useError } from '../../ErrorContext';
import { declareActorRoundInitiative } from '../api/actor-rounds';
import { CombatContext } from './CombatProvider';

const DeclareInitiativeDialog = ({ actorRound, open, setOpen }) => {
  const { showError } = useError();
  const [roll, setRoll] = useState(actorRound.initiative?.roll || 0);
  const { actorRounds, setActorRounds } = useContext(CombatContext);

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeclare = () => {
    declareActorRoundInitiative(actorRound.id, parseInt(roll))
      .then((updatedActorRound) => {
        const updatedActorRounds = actorRounds.filter((ar) => ar.id !== updatedActorRound.id);
        updatedActorRounds.push(updatedActorRound);
        updatedActorRounds.sort((a, b) => b.initiative.total || 0 - a.initiative.total || 0);
        setActorRounds(updatedActorRounds);
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
          <DialogContentText>Declare initiative (2D10)</DialogContentText>
          <pre>Actor round: {JSON.stringify(actorRound, null, 2)}</pre>
          <Grid container spacing={2}>
            <Grid item size={6}>
              Initiative base:
            </Grid>
            <Grid item size={6}>
              {actorRound.initiative?.base || 0}
            </Grid>
            <Grid item size={6}>
              Modifier:
            </Grid>
            <Grid item size={6}>
              {actorRound.initiative?.penalty || 0}
            </Grid>
            <Grid item size={6}>
              <TextField
                autoFocus
                required
                id="roll"
                name="roll"
                label="initiative-roll"
                value={roll}
                fullWidth
                variant="standard"
                onChange={(e) => setRoll(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={() => handleDeclare()}>Declare</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeclareInitiativeDialog;
