import React, { useState, useContext, FC, useEffect, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, TextField } from '@mui/material';
import { CombatContext } from '../../../CombatContext';
import { useError } from '../../../ErrorContext';
import { declareActorRoundInitiative } from '../../api/actor-rounds';
import type { ActorRound } from '../../api/actor-rounds';
import NumericTextField from '../../shared/inputs/NumericTextField';

const DeclareInitiativeDialog: FC<{
  actorRound: ActorRound;
  open: boolean;
  setOpen: (open: boolean) => void;
}> = ({ actorRound, open, setOpen }) => {
  const { t } = useTranslation();
  const { showError } = useError();
  const [roll, setRoll] = useState<number>(actorRound.initiative?.roll || 0);
  const { updateActorRound } = useContext(CombatContext)!;

  const handleRandomRoll = () => {
    const die1 = Math.floor(Math.random() * 10) + 1;
    const die2 = Math.floor(Math.random() * 10) + 1;
    setRoll(die1 + die2);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeclare = () => {
    declareActorRoundInitiative(actorRound.id, roll)
      .then((updatedActorRound) => {
        updateActorRound(updatedActorRound);
        setRoll(2);
        setOpen(false);
      })
      .catch((error: unknown) => {
        if (error instanceof Error) showError(error.message);
        else showError('An unknown error occurred');
      });
  };

  const handleRollChange = (e: ChangeEvent<HTMLInputElement>) => {
    const check = Number(e.target.value);
    if (isNaN(check)) {
      setRoll(1);
      return;
    }
    setRoll(Math.max(1, Math.min(20, check)));
  };

  useEffect(() => {
    setRoll(actorRound.initiative?.roll || '');
  }, [actorRound]);

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{actorRound.actorName} initiative declaration</DialogTitle>
      <DialogContent>
        <DialogContentText>Declare initiative (2D10)</DialogContentText>
        <Grid container spacing={2}>
          <Grid size={6}>Initiative base:</Grid>
          <Grid size={6}>{actorRound.initiative?.base || 0}</Grid>
          <Grid size={6}>Modifiers:</Grid>
          <Grid size={6}>{actorRound.initiative?.penalty || 0}</Grid>
          <Grid size={6}>
            <NumericTextField label={t('initiative-roll')} value={roll} onChange={handleRollChange} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleRandomRoll}>Random Roll</Button>
        <Button onClick={handleDeclare}>Declare</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeclareInitiativeDialog;
