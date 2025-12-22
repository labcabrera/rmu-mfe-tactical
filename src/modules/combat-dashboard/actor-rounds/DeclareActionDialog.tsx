import React, { useContext, FC, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  TextField,
  FormControlLabel,
  FormControl,
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
  //const [meleeType, setMeleeType] = useState<'one' | 'two'>('one');
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
    // Include selected attacks when melee-attack
    if (opt.key === 'melee-attack') {
      if (actorRound.attacks && actorRound.attacks.length > 0) {
        base.attacks = actorRound.attacks.map((a: any) => ({ modifiers: { attackName: a.attackName } }));
      } else {
        base.attacks = [];
      }
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
      <DialogTitle>{actorRound.actorName} action declaration</DialogTitle>
      <DialogContent>
        <DialogContentText>Action type</DialogContentText>

        <Grid container spacing={1} sx={{ mt: 1 }}>
          {[
            { key: 'movement', label: 'Movement', freeAction: false },
            { key: 'melee-attack', label: 'Melee attack', freeAction: false },
            { key: 'ranged-attack', label: 'Ranged attack', freeAction: false },
            { key: 'draw-and-load', label: 'Draw and load ammo', freeAction: false },
            { key: 'partial-dodge', label: 'Partial dodge', freeAction: false },
            { key: 'full-dodge', label: 'Full dodge', freeAction: false },
            { key: 'perception', label: 'Perception', freeAction: true },
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
          {actionForm.actionType === 'melee-attack' && (
            <>
              {/* Show available attacks from actorRound and allow selecting one */}
              {actorRound.attacks && actorRound.attacks.length > 0 && (
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  {actorRound.attacks.map((atk: any) => {
                    const selected =
                      actionForm.attacks &&
                      actionForm.attacks.some(
                        (a: any) =>
                          (a.modifiers && a.modifiers.attackName) === atk.attackName || a.attackName === atk.attackName
                      );

                    const toggleAttack = (attackName: string) => {
                      const current = actionForm.attacks || [];
                      const exists = current.some(
                        (a: any) =>
                          (a.modifiers && a.modifiers.attackName) === attackName || a.attackName === attackName
                      );
                      let next: any[];
                      if (exists) {
                        next = current.filter(
                          (a: any) =>
                            !((a.modifiers && a.modifiers.attackName) === attackName || a.attackName === attackName)
                        );
                      } else {
                        next = [...current, { modifiers: { attackName } }];
                      }
                      setActionForm({ ...actionForm, attacks: next });
                    };

                    return (
                      <Grid key={atk.attackName}>
                        <Button
                          variant={selected ? 'contained' : 'outlined'}
                          onClick={() => toggleAttack(atk.attackName)}
                        >
                          {atk.attackName}
                        </Button>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </>
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
