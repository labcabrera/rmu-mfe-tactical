import React, { useState, useContext } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, TextField } from '@mui/material';
import { CombatContext } from '../../../CombatContext';
import { useError } from '../../../ErrorContext';
import { declareActorRoundInitiative } from '../../api/actor-rounds';
import type { ActorRound } from '../../api/actor-rounds';

type DeclareInitiativeDialogProps = {
  actorRound: ActorRound;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DeclareInitiativeDialog: React.FC<DeclareInitiativeDialogProps> = ({ actorRound, open, setOpen }) => {
  const { showError } = useError();
  const [roll, setRoll] = useState<string | number>(actorRound.initiative?.roll || '');
  const { updateActorRound } = useContext(CombatContext)!;

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeclare = () => {
    declareActorRoundInitiative(actorRound.id, parseInt(roll as string, 10))
      .then((updatedActorRound) => {
        updateActorRound(updatedActorRound);
        setRoll('');
        setOpen(false);
      })
      .catch((error: unknown) => {
        if (error instanceof Error) showError(error.message);
        else showError('An unknown error occurred');
      });
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Declare actor round initiative</DialogTitle>
      <DialogContent>
        <DialogContentText>Declare initiative (2D10)</DialogContentText>
        <pre>Actor round: {JSON.stringify(actorRound, null, 2)}</pre>
        <Grid container spacing={2}>
          <Grid size={6}>Initiative base:</Grid>
          <Grid size={6}>{actorRound.initiative?.base || 0}</Grid>
          <Grid size={6}>Modifier:</Grid>
          <Grid size={6}>{actorRound.initiative?.penalty || 0}</Grid>
          <Grid size={6}>
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
        <Button onClick={handleDeclare}>Declare</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeclareInitiativeDialog;
