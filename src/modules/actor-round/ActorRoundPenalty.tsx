import React, { FC, useContext, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Stack, Typography, Chip, Box, TextField, IconButton } from '@mui/material';
import { CombatContext } from '../../CombatContext';
import { useError } from '../../ErrorContext';
import { ActorRound, ActorRoundPenaltyModifier } from '../api/actor-rounds.dto';
import { useTranslation } from 'react-i18next';

const ActorRoundPenalty: FC<{
  actorRound: ActorRound;
}> = ({ actorRound }) => {
  const { t } = useTranslation();
  const [newPenalty, setNewPenalty] = useState('');
  const { showError } = useError();
  const { updateActorRound } = useContext(CombatContext)!;

  const addPenalty = () => {
    //TODO
  };

  const removePenalty = (id: string) => {
    //TODO
  };

  const getLabelForState = (state: ActorRoundPenaltyModifier) => {
    return `${t(`effect-${state.source}`)}${state.value ? ` ${state.value}` : ''}`;
  };

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Penalties</Typography>

      {(actorRound.penalty.modifiers || []).length === 0 ? (
        <Typography variant="body2">No penalties</Typography>
      ) : (
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          {(actorRound.penalty.modifiers || []).map((s: ActorRoundPenaltyModifier, i: number) => (
            <Chip
              key={`${s.source}-${i}`}
              label={getLabelForState(s)}
              onDelete={() => removePenalty(s.id)}
              deleteIcon={<DeleteIcon />}
              sx={{ m: 0.5 }}
            />
          ))}
        </Stack>
      )}

      <Box sx={{ mt: 1, display:"flex", alignItems:"center" }}>
        <TextField
          size="small"
          label="New penalty"
          value={newPenalty}
          onChange={(e) => setNewPenalty(e.target.value)}
          sx={{ mr: 1 }}
        />
        <IconButton color="primary" onClick={addPenalty} disabled={!newPenalty}>
          <AddIcon />
        </IconButton>
      </Box>
    </Stack>
  );
};

export default ActorRoundPenalty;
