import React, { FC } from 'react';
import { Stack } from '@mui/material';
import { EffectList } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActorRound } from '../../api/actor-rounds.dto';
import ActorRoundAlerts from './ActorRoundAlerts';

/** Effects, penalties and pending alerts of an actor. */
const ActorRoundEffects: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  if (!actorRound) return null;
  return (
    <Stack spacing={1} sx={{ p: 1.25 }}>
      <EffectList
        effects={actorRound.effects}
        penalties={(actorRound.penalty?.modifiers || []).map((modifier) => ({
          source: modifier.source,
          value: modifier.value,
        }))}
      />
      <ActorRoundAlerts actorRound={actorRound} />
    </Stack>
  );
};

export default ActorRoundEffects;
