import React, { useState, useContext, FC, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Slide,
  Stack,
  Typography,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { CategorySeparator, NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { declareActorRoundInitiative } from '../../../api/actor-rounds';
import { ActorRound } from '../../../api/actor-rounds.dto';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DeclareInitiativeDialog: FC<{
  actorRound: ActorRound;
  open: boolean;
  setOpen: (open: boolean) => void;
}> = ({ actorRound, open, setOpen }) => {
  const { showError } = useError();
  const [roll, setRoll] = useState<number | undefined>(actorRound.initiative?.roll || undefined);
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
    if (!roll) return;
    declareActorRoundInitiative(actorRound.id, roll)
      .then((updatedActorRound) => {
        updateActorRound(updatedActorRound);
        setRoll(undefined);
        setOpen(false);
      })
      .catch((err) => showError(err.message));
  };

  useEffect(() => {
    setRoll(actorRound.initiative?.roll || 0);
  }, [actorRound]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slots={{
        transition: Transition,
      }}
    >
      <DialogTitle>Initiative declaration</DialogTitle>
      <DialogContent>
        <Grid container spacing={1}>
          <Grid size={12}>
            <CategorySeparator text={t('Modifiers')} />
          </Grid>
          <Grid size={6}>
            <Stack>
              <Typography color="primary" variant="body1">
                {actorRound.initiative?.base || 0}
              </Typography>
              <Typography color="secondary" variant="body2">
                {t('initiative-base')}
              </Typography>
            </Stack>
          </Grid>
          <Grid size={6}>
            <Stack>
              <Typography color="primary" variant="body1">
                {actorRound.initiative?.penalty || 0}
              </Typography>
              <Typography color="secondary" variant="body2">
                {t('initiative-penalty')}
              </Typography>
            </Stack>
          </Grid>
          <Grid size={12}>
            <CategorySeparator text={t('Roll (2D10)')} />
          </Grid>
          <Grid size={6}>
            <NumericInput
              label={t('initiative-roll')}
              value={roll || null}
              onChange={(e) => setRoll(e || undefined)}
              inputMode="numeric"
              min={2}
              max={20}
              integer
              allowNegatives={false}
            />
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
