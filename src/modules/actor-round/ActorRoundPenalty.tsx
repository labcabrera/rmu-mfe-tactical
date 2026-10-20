import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Stack, Typography, Chip, Box, TextField, IconButton } from '@mui/material';
import { ActorRound, ActorRoundPenaltyModifier } from '../api/actor-rounds.dto';

const ActorRoundPenalty: FC<{
  actorRound: ActorRound;
}> = ({ actorRound }) => {
  const { t } = useTranslation();
  const [newPenalty, setNewPenalty] = useState('');

  const addPenalty = () => {
    //TODO
  };

  const removePenalty = () => {
    //TODO
  };

  const getLabelForState = (state: ActorRoundPenaltyModifier) => {
    return `${t(`penalty-${state.source}`, { defaultValue: t(state.source) })}${state.value ? ` ${state.value}` : ''}`;
  };

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">{t('penalties')}</Typography>

      {(actorRound.penalty.modifiers || []).length === 0 ? (
        <Typography variant="body2">{t('no-penalties')}</Typography>
      ) : (
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          {(actorRound.penalty.modifiers || []).map((s: ActorRoundPenaltyModifier, i: number) => (
            <Chip
              key={`${s.source}-${i}`}
              label={getLabelForState(s)}
              onDelete={() => removePenalty()}
              deleteIcon={<DeleteIcon />}
              sx={{ m: 0.5 }}
            />
          ))}
        </Stack>
      )}

      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
        <TextField
          size="small"
          label={t('new-penalty')}
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
