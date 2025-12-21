import React, { useContext, FC, useEffect, useState, act } from 'react';
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
  Select,
  MenuItem,
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
  const { updateActorRound } = useContext(CombatContext)!;
  const [actionForm, setActionForm] = useState({
    gameId: actorRound.gameId,
    actorId: actorRound.actorId,
    actionType: null,
    phaseStart: phaseNumber,
  });
  const [movementSpeed, setMovementSpeed] = useState<number | ''>('');
  const [meleeType, setMeleeType] = useState<'one' | 'two'>('one');
  const [otherDetails, setOtherDetails] = useState<string>('');
  const { roundActions, setRoundActions } = useContext(CombatContext)!;

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeclare = () => {
    createAction(actionForm)
      .then((action) => {
        setRoundActions([...roundActions, action]);
      })
      .catch((err) => showError(err.message));
  };

  useEffect(() => {}, [actorRound]);

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{actorRound.actorName} action declaration</DialogTitle>
      <DialogContent>
        <DialogContentText>Action type</DialogContentText>

        <Grid container spacing={1} sx={{ mt: 1 }}>
          {[
            { key: 'movement', label: 'Movement' },
            { key: 'attack', label: 'Melee attack' },
            { key: 'ranged-attack', label: 'Ranged attack' },
            { key: 'static-maneuver', label: 'Static maneuver' },
            { key: 'movement-maneuver', label: 'Movement maneuver' },
            { key: 'cast-spell', label: 'Cast spell' },
            { key: 'other', label: 'Other' },
          ].map((opt) => (
            <Grid key={opt.key}>
              <Button
                variant={actionForm.actionType === opt.key ? 'contained' : 'outlined'}
                onClick={() => setActionForm({ ...actionForm, actionType: opt.key })}
              >
                {opt.label}
              </Button>
            </Grid>
          ))}
        </Grid>

        {/* Opciones extra según selección */}
        <div style={{ marginTop: 16 }}>
          {actionForm.actionType === 'movement' && (
            <Grid container spacing={2} alignItems="center">
              <Grid>
                <FormControl sx={{ minWidth: 160 }}>
                  <FormLabel>Pace</FormLabel>
                  <Select value={(actorRound as any).movementMode ?? 'walk'} onChange={() => {}} size="small">
                    <MenuItem value="walk">Walk</MenuItem>
                    <MenuItem value="run">Run</MenuItem>
                    <MenuItem value="dash">Dash</MenuItem>
                  </Select>
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
        <Button onClick={handleDeclare}>Declare</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeclareActionDialog;
