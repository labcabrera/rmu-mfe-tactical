import React, { FC } from 'react';
import { Avatar, Chip, Stack } from '@mui/material';
import type { ActorRound, ActorRoundEffect } from '../../api/actor-rounds';

const ActorRoundEffects: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  if (!actorRound) return <p>Loading...</p>;

  if (!actorRound.effects || actorRound.effects.length === 0) return null;

  return (
    <>
      <Stack direction="row" spacing={1}>
        {actorRound.effects.map((effect, index) => (
          <ActorRoundEffect key={index} effect={effect} />
        ))}
      </Stack>
      {/* <pre>{JSON.stringify(actorRound.effects, null, 2)}</pre> */}
    </>
  );
};

export default ActorRoundEffects;

const ActorRoundEffect: FC<{ effect: ActorRoundEffect }> = ({ effect }) => {
  const getLabel = () => {
    switch (effect.status) {
      case 'death':
        return 'Death';
        break;
    }
    return '';
  };

  return <Chip avatar={<Avatar alt={getLabel()} src={`/static/images/icons/${effect.status}.png`} />} label={getLabel()} />;
};
