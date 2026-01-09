import React, { Dispatch, FC, SetStateAction, useContext, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Stack, Typography, Chip, Box, TextField, IconButton } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../CombatContext';
import { useError } from '../../ErrorContext';
import { addActorRoundEffect, deleteActorRoundEffect } from '../api/actor-rounds';
import { ActorRound } from '../api/actor-rounds.dto';

const ActorRoundEffects: FC<{
  actorRound: ActorRound;
  setActorRound: Dispatch<SetStateAction<ActorRound>>;
}> = ({ actorRound, setActorRound }) => {
  const [newState, setNewState] = useState('');
  const { showError } = useError();
  const { refreshActorRounds } = useContext(CombatContext);

  const addState = () => {
    const effect = { status: newState } as any;
    addActorRoundEffect(actorRound.id, effect)
      .then((updatedActorRound) => {
        setActorRound(updatedActorRound);
        refreshActorRounds();
      })
      .catch((err) => showError(err));
  };

  const removeState = (id: string) => {
    deleteActorRoundEffect(actorRound.id, id)
      .then((updatedActorRound) => {
        setActorRound(updatedActorRound);
        refreshActorRounds();
      })
      .catch((err) => showError(err));
  };

  const getLabelForState = (state: any) => {
    return `${t(`effect-${state.status}`)}${state.value ? ` ${state.value}` : ''}`;
  };

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Effects / States</Typography>

      {(actorRound.effects || []).length === 0 ? (
        <Typography variant="body2">No states</Typography>
      ) : (
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          {(actorRound.effects || []).map((s: any, i: number) => (
            <Chip
              key={`${s.status}-${i}`}
              label={getLabelForState(s)}
              onDelete={() => removeState(s.id)}
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
      </Box>
    </Stack>
  );
};

export default ActorRoundEffects;
