import React, { FC } from 'react';
import { Stack, Typography, Chip } from '@mui/material';
import { ActorRound, ActorRoundAttack } from '../api/actor-rounds.dto';

const ActorRoundAttacks: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Attacks</Typography>
      {actorRound.attacks && actorRound.attacks.length > 0 ? (
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          {actorRound.attacks.map((a: ActorRoundAttack, i: number) => (
            <Chip key={`${a.attackName}-${i}`} label={a.attackName} />
          ))}
        </Stack>
      ) : (
        <Typography variant="body2">No attacks</Typography>
      )}
    </Stack>
  );
};

export default ActorRoundAttacks;
