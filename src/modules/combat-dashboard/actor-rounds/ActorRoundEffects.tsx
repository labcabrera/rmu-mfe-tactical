import React, { FC } from 'react';
import { Grid } from '@mui/material';
import { ActorRound } from '../../api/actor-rounds.dto';
import Effect from '../../shared/generic/Effect';

const ActorRoundEffects: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  if (!actorRound) return <p>Loading...</p>;

  if (!actorRound.effects || actorRound.effects.length === 0) return null;

  return (
    <Grid container spacing={1}>
      {actorRound.effects.map((effect, index) => (
        <Effect key={`effect-${index}`} effect={effect.status} rounds={effect.rounds} value={effect.value} />
      ))}
    </Grid>
  );
};

export default ActorRoundEffects;
