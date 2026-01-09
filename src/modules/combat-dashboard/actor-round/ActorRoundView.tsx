import React, { FC, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Typography, Stack, Chip, TextField, Button, Divider, Paper, Grid, IconButton } from '@mui/material';
import { ActorRound } from '../../api/actor-rounds.dto';

/**
 * ActorRoundView
 * Dashboard that shows all key information of an `actorRound` object
 * and provides simple controls to add / remove `states` (effects).
 *
 * This is a lean, local-state component — for persistent changes you
 * should call the API from the parent and update the actorRound prop.
 */

const ActorRoundView: FC<{ actorRound: ActorRound; onChange?: (next: ActorRound) => void }> = ({
  actorRound,
  onChange,
}) => {
  const [localStates, setLocalStates] = useState(actorRound.effects || []);
  const [newState, setNewState] = useState('');

  const addState = () => {
    if (!newState) return;
    const next = [...localStates, { status: newState } as any];
    setLocalStates(next);
    setNewState('');
    if (onChange) onChange({ ...actorRound, effects: next });
  };

  const removeState = (index: number) => {
    const next = localStates.filter((_, i) => i !== index);
    setLocalStates(next);
    if (onChange) onChange({ ...actorRound, effects: next });
  };

  return (
    <Paper sx={{ p: 2 }} elevation={1}>
      <Typography variant="h6">ActorRound</Typography>
      <Divider sx={{ my: 1 }} />

      <Grid container spacing={2}>
        <Grid size={12}>
          <Stack spacing={1}>
            <Typography variant="subtitle2">Identity</Typography>
            <Typography variant="body2">Actor: {actorRound.actorName}</Typography>
            <Typography variant="body2">ActorId: {actorRound.actorId}</Typography>
            <Typography variant="body2">Game: {actorRound.gameId}</Typography>
            <Typography variant="body2">Phase start: {actorRound.phaseStart}</Typography>
          </Stack>

          <Divider sx={{ my: 1 }} />

          <Stack spacing={1}>
            <Typography variant="subtitle2">HP / Fatigue</Typography>
            <Typography variant="body2">
              HP: {actorRound.hp?.current} / {actorRound.hp?.max}
            </Typography>
            <Typography variant="body2">Fatigue: {Math.round(actorRound.fatigue?.accumulator ?? 0)}</Typography>
          </Stack>

          <Divider sx={{ my: 1 }} />

          <Stack spacing={1}>
            <Typography variant="subtitle2">Initiative</Typography>
            <Typography variant="body2">Roll: {actorRound.initiative?.roll ?? '-'}</Typography>
            <Typography variant="body2">Total: {actorRound.initiative?.total ?? '-'}</Typography>
          </Stack>
        </Grid>

        <Grid size={12}>
          <Stack spacing={1}>
            <Typography variant="subtitle2">Attacks</Typography>
            {actorRound.attacks && actorRound.attacks.length > 0 ? (
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {actorRound.attacks.map((a: any) => (
                  <Chip key={a.attackName} label={a.attackName} />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2">No attacks</Typography>
            )}
          </Stack>

          <Divider sx={{ my: 1 }} />

          <Stack spacing={1}>
            <Typography variant="subtitle2">Effects / States</Typography>

            {localStates.length === 0 ? (
              <Typography variant="body2">No states</Typography>
            ) : (
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {localStates.map((s: any, i: number) => (
                  <Chip
                    key={`${s.status}-${i}`}
                    label={s.status}
                    onDelete={() => removeState(i)}
                    deleteIcon={<DeleteIcon />}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Stack>
            )}

            <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
              <TextField
                size="small"
                label="New state"
                value={newState}
                onChange={(e) => setNewState(e.target.value)}
                sx={{ mr: 1 }}
              />
              <IconButton color="primary" onClick={addState} disabled={!newState}>
                <AddIcon />
              </IconButton>
              <Button
                sx={{ ml: 1 }}
                onClick={() => {
                  setLocalStates(actorRound.effects || []);
                  setNewState('');
                }}
              >
                Reset
              </Button>
            </Box>
          </Stack>
        </Grid>
      </Grid>

      <Divider sx={{ my: 1 }} />

      <Box>
        <Typography variant="subtitle2">Raw object (debug)</Typography>
        <Box component="pre" sx={{ maxHeight: 200, overflow: 'auto', fontSize: 12 }}>
          {JSON.stringify(actorRound, null, 2)}
        </Box>
      </Box>
    </Paper>
  );
};

export default ActorRoundView;
