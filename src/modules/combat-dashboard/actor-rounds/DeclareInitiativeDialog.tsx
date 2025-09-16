import React, { useState, useContext, FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid } from '@mui/material';
import { CombatContext } from '../../../CombatContext';
import { useError } from '../../../ErrorContext';
import { declareActorRoundInitiative } from '../../api/actor-rounds';
import { ActorRound } from '../../api/actor-rounds.dto';
import { NumericInput } from '../../shared/inputs/NumericInput';
import NumericReadonlyInput from '../../shared/inputs/NumericReadonlyInput';

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

  const handleRollChange = (e: number | null) => {
    const check = Math.max(2, Math.min(20, e));
    setRoll(check);
  };

  useEffect(() => {
    setRoll(actorRound.initiative?.roll || 0);
  }, [actorRound]);

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{actorRound.actorName} initiative declaration</DialogTitle>
      <DialogContent>
        <DialogContentText>Declare initiative (2D10)</DialogContentText>
        <Grid container spacing={2}>
          <Grid size={6}>
            <NumericReadonlyInput label={t('initiative-base')} name="initiative-base" value={actorRound.initiative?.base} />
          </Grid>
          <Grid size={6}></Grid>
          <Grid size={6}>
            <NumericReadonlyInput label={t('initiative-penalty')} name="initiative-penalty" value={actorRound.initiative?.penalty} />
          </Grid>
          <Grid size={6}></Grid>
          <Grid size={6}>
            <NumericInput label={t('initiative-roll')} value={roll} onChange={handleRollChange} inputMode="numeric" integer allowNegatives={false} />
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
