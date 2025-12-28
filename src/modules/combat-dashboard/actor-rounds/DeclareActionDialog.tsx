import React, { useContext, FC, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  FormControlLabel,
  FormControl,
  FormLabel,
  Switch,
} from '@mui/material';
import { CombatContext } from '../../../CombatContext';
import { useError } from '../../../ErrorContext';
import { createAction } from '../../api/action';
import { ActorRound } from '../../api/actor-rounds.dto';
import SelectManeuverType from '../../shared/selects/SelectManeuverType';
import SelectSkillByCategory from '../../shared/selects/SelectSkillByCategory';

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
    attackNames: null as string[] | null,
    maneuver: {
      skillId: null as string | null,
      maneuverType: null as string | null,
    },
  });
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

    if (opt.key === 'melee_attack') {
      if (actorRound.attacks && actorRound.attacks.length > 0) {
        base.attackNames = actorRound.attacks.map((a: any) => a.attackName);
      } else {
        base.attackNames = [];
      }
    }

    if (opt.key === 'maneuver') {
      base.maneuver = {
        skillId: null,
        maneuverType: 'absolute',
      };
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
        <Grid container spacing={1} sx={{ mt: 1 }} direction="column">
          {(
            [
              {
                key: 'movement',
                title: 'Movement',
                options: [
                  { key: 'movement', label: 'Movement', freeAction: true },
                  { key: 'stand-up', label: 'Stand up', freeAction: false },
                ],
              },
              {
                key: 'combat',
                title: 'Combat',
                options: [
                  { key: 'melee_attack', label: 'Melee attack', freeAction: false },
                  { key: 'ranged_attack', label: 'Ranged attack', freeAction: false },
                  { key: 'draw-and-load', label: 'Draw and load ammo', freeAction: false },
                  { key: 'partial-dodge', label: 'Partial dodge', freeAction: false },
                  { key: 'full-dodge', label: 'Full dodge', freeAction: false },
                ],
              },
              {
                key: 'maneuvers',
                title: 'Maneuvers',
                options: [
                  { key: 'movement_maneuver', label: 'Movement maneuver', freeAction: false },
                  { key: 'maneuver', label: 'Maneuver', freeAction: true },
                ],
              },
              {
                key: 'spells',
                title: 'Spells',
                options: [
                  { key: 'cast-spell', label: 'Cast spell', freeAction: true },
                  { key: 'cast-instant', label: 'Cast instant', freeAction: true },
                ],
              },
              {
                key: 'other',
                title: 'Other',
                options: [
                  { key: 'perception', label: 'Perception', freeAction: true },
                  { key: 'drop-item', label: 'Drop item', freeAction: true },
                  { key: 'other', label: 'Other', freeAction: false },
                ],
              },
            ] as Array<{
              key: string;
              title: string;
              options: { key: string; label: string; freeAction?: boolean }[];
            }>
          ).map((group) => (
            <FormControl key={group.key} sx={{ mb: 2, width: '100%' }}>
              <FormLabel>{group.title}</FormLabel>
              <Grid container spacing={1} sx={{ mt: 1 }} wrap="wrap" alignItems="stretch">
                {group.options.map((opt) => (
                  <Grid key={opt.key}>
                    <Button
                      fullWidth
                      variant={actionForm.actionType === opt.key ? 'contained' : 'outlined'}
                      onClick={() => handleSelectAction(opt)}
                    >
                      {opt.label}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </FormControl>
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
          {actionForm.actionType === 'melee_attack' && (
            <>
              {/* Show available attacks from actorRound and allow selecting one */}
              {actorRound.attacks && actorRound.attacks.length > 0 && (
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  {actorRound.attacks.map((atk: any) => {
                    const selected = actionForm.attackNames && actionForm.attackNames.includes(atk.attackName);

                    const toggleAttack = (attackName: string) => {
                      const current: string[] = actionForm.attackNames || [];
                      const exists = current.includes(attackName);
                      let next: string[];
                      if (exists) {
                        next = current.filter((n) => n !== attackName);
                      } else {
                        next = [...current, attackName];
                      }
                      setActionForm({ ...actionForm, attackNames: next });
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

          {actionForm.actionType === 'maneuver' && (
            <>
              <SelectManeuverType
                value={actionForm.maneuver.maneuverType || ''}
                onChange={(maneuverType: string): void => {
                  setActionForm({
                    ...actionForm,
                    maneuver: {
                      ...actionForm.maneuver,
                      maneuverType,
                    },
                  });
                }}
              />
              <SelectSkillByCategory
                value={actionForm.maneuver.skillId || ''}
                onChange={(skillId: string): void => {
                  setActionForm({
                    ...actionForm,
                    maneuver: {
                      ...actionForm.maneuver,
                      skillId,
                    },
                  });
                }}
              />
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
