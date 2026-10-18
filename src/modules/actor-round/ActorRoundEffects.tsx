import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Stack, Typography, Chip, Box, TextField, IconButton } from '@mui/material';
import { useNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../CombatContext';
import { addActorRoundEffect, deleteActorRoundEffect } from '../api/actor-rounds';
import { ActorRound, ActorRoundEffect } from '../api/actor-rounds.dto';

const ActorRoundEffects: FC<{
  actorRound: ActorRound;
}> = ({ actorRound }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const [newState, setNewState] = useState('');
  const notify = useNotify();
  const { updateActorRound } = useContext(CombatContext)!;

  const addState = () => {
    const effect: ActorRoundEffect = { id: '', status: newState, value: undefined, rounds: undefined };
    addActorRoundEffect(actorRound.id, effect, auth)
      .then((updatedActorRound) => updateActorRound(updatedActorRound))
      .catch((err) => notify.error(err));
  };

  const removeState = (id: string) => {
    deleteActorRoundEffect(actorRound.id, id, auth)
      .then((updatedActorRound) => updateActorRound(updatedActorRound))
      .catch((err) => notify.error(err));
  };

  const getLabelForState = (state: ActorRoundEffect) => {
    return `${t(state.status)}${state.value ? ` ${state.value}` : ''}`;
  };

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">{t('effects-states')}</Typography>

      {(actorRound.effects || []).length === 0 ? (
        <Typography variant="body2">{t('no-states')}</Typography>
      ) : (
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          {(actorRound.effects || []).map((s: ActorRoundEffect, i: number) => (
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

      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
        <TextField
          size="small"
          label={t('new-state')}
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
