import React, { FC, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Stack, Typography, Chip, Box, TextField, IconButton, Button } from '@mui/material';
import { ActorRound } from '../../api/actor-rounds.dto';

const ActorRoundEffects: FC<{
  actorRound: ActorRound;
  onChange?: (nextEffects: any[]) => void;
}> = ({ actorRound, onChange }) => {
  const [localStates, setLocalStates] = useState(actorRound.effects || []);
  const [newState, setNewState] = useState('');

  const addState = () => {
    if (!newState) return;
    const next = [...localStates, { status: newState } as any];
    setLocalStates(next);
    setNewState('');
    if (onChange) onChange(next);
  };

  const removeState = (index: number) => {
    const next = localStates.filter((_, i) => i !== index);
    setLocalStates(next);
    if (onChange) onChange(next);
  };

  return (
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
  );
};

export default ActorRoundEffects;
