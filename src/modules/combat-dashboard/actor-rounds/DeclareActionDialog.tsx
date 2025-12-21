import React, { useContext, FC, useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Switch,
} from '@mui/material';
import { CombatContext } from '../../../CombatContext';
import { useError } from '../../../ErrorContext';
import { createAction } from '../../api/action';
import { ActorRound } from '../../api/actor-rounds.dto';

const DeclareActionDialog: FC<{
  actorRound: ActorRound;
  phaseNumber: number;
  open: boolean;
  setOpen: (open: boolean) => void;
}> = ({ actorRound, phaseNumber, open, setOpen }) => {
  const { showError } = useError();
  const [actionForm, setActionForm] = useState({
    gameId: actorRound.gameId,
    actorId: actorRound.actorId,
    actionType: null,
    freeAction: false,
    pace: (actorRound as any).movementMode ?? null,
    phaseStart: phaseNumber,
  });
  //   const [movementSpeed, setMovementSpeed] = useState<number | ''>('');
  const [meleeType, setMeleeType] = useState<'one' | 'two'>('one');
  const [otherDetails, setOtherDetails] = useState<string>('');
  const { roundActions, setRoundActions } = useContext(CombatContext)!;

  const handleClose = () => {
    setOpen(false);
  };

  const handleSelectAction = (opt: { key: string; freeAction?: boolean }) => {
    const base = {
      gameId: actorRound.gameId,
      actorId: actorRound.actorId,
      actionType: opt.key,
      freeAction: !!opt.freeAction,
      phaseStart: phaseNumber,
    } as any;
    // Only include pace when movement
    if (opt.key === 'movement') {
      base.pace = (actorRound as any).movementMode ?? 'walk';
    }
    // Include melee type when attack
    if (opt.key === 'attack') {
      base.meleeType = meleeType;
    }
    // Include details when other
    if (opt.key === 'other') {
      base.details = otherDetails;
    }
    setActionForm(base);
  };

  const handleDeclare = () => {
    createAction(actionForm)
      .then((action) => {
        setRoundActions([...roundActions, action]);
        setOpen(false);
      })
      .catch((err) => showError(err.message));
  };

  useEffect(() => {}, [actorRound]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
      <DialogTitle>{actorRound.actorName} action declaration</DialogTitle>
      <DialogContent>
        <DialogContentText>Action type</DialogContentText>

        <Grid container spacing={1} sx={{ mt: 1 }}>
          {[
            { key: 'movement', label: 'Movement', freeAction: false },
            { key: 'attack', label: 'Melee attack', freeAction: false },
            { key: 'ranged', label: 'Ranged attack', freeAction: false },
            { key: 'draw-and-load', label: 'Draw and load ammo', freeAction: false },
            { key: 'partial-dodge', label: 'Partial dodge', freeAction: false },
            { key: 'full-dodge', label: 'Full dodge', freeAction: false },
            { key: 'stand-up', label: 'Stand up', freeAction: false },
            { key: 'drop-item', label: 'Drop item', freeAction: true },
            { key: 'static_maneuver', label: 'Static maneuver', freeAction: true },
            { key: 'movement_maneuver', label: 'Movement maneuver', freeAction: false },
            { key: 'cast-spell', label: 'Cast spell', freeAction: true },
            { key: 'cast-instant', label: 'Cast instant', freeAction: true },
            { key: 'other', label: 'Other', freeAction: false },
          ].map((opt) => (
            <Grid key={opt.key}>
              <Button
                variant={actionForm.actionType === opt.key ? 'contained' : 'outlined'}
                onClick={() => handleSelectAction(opt)}
              >
                {opt.label}
              </Button>
            </Grid>
          ))}
        </Grid>

        {/* Free action toggle (configurable per action type) */}
        {actionForm.actionType && (
          <FormControl sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!actionForm.freeAction}
                  onChange={(e) => setActionForm({ ...actionForm, freeAction: e.target.checked })}
                />
              }
              label="Free action"
            />
          </FormControl>
        )}

        <div style={{ marginTop: 16 }}>
          {actionForm.actionType === 'movement' && (
            <Grid container spacing={2} alignItems="center">
              <Grid>
                <FormControl>
                  <FormLabel>Pace</FormLabel>
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    {['creep', 'walk', 'jog', 'run', 'spring', 'dash'].map((p) => (
                      <Grid key={p}>
                        <Button
                          variant={actionForm.pace === p ? 'contained' : 'outlined'}
                          onClick={() => setActionForm({ ...actionForm, pace: p })}
                        >
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </FormControl>
              </Grid>
            </Grid>
          )}

          {actionForm.actionType === 'attack' && (
            <FormControl>
              <FormLabel>Melee type</FormLabel>
              <RadioGroup row value={meleeType} onChange={(e) => setMeleeType(e.target.value as 'one' | 'two')}>
                <FormControlLabel value="one" control={<Radio />} label="One-handed" />
                <FormControlLabel value="two" control={<Radio />} label="Two-handed" />
              </RadioGroup>
            </FormControl>
          )}

          {actionForm.actionType === 'other' && (
            <TextField
              label="Details"
              value={otherDetails}
              onChange={(e) => setOtherDetails(e.target.value)}
              fullWidth
              multiline
              rows={3}
              sx={{ mt: 1 }}
            />
          )}
        </div>
        <pre>{JSON.stringify(actionForm, null, 2)}</pre>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button disabled={!actionForm.actionType} onClick={handleDeclare}>
          Declare
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeclareActionDialog;
