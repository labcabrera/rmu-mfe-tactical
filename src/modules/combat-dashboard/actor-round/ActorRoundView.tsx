import React, { FC } from 'react';
import { Paper, Divider, Box } from '@mui/material';
import { ActorRound } from '../../api/actor-rounds.dto';
import ActorRoundAttacks from './ActorRoundAttacks';
import ActorRoundBars from './ActorRoundBars';
import ActorRoundEffects from './ActorRoundEffects';
import ActorRoundHeader from './ActorRoundHeader';

/**
 * ActorRoundView (refactored)
 * Composes smaller child components to display the actorRound details.
 */
const ActorRoundView: FC<{ actorRound: ActorRound; onChange?: (next: ActorRound) => void }> = ({
  actorRound,
  onChange,
}) => {
  const handleEffectsChange = (nextEffects: any[]) => {
    if (onChange) onChange({ ...actorRound, effects: nextEffects });
  };

  return (
    <Paper sx={{ p: 2 }} elevation={1}>
      <ActorRoundHeader actorRound={actorRound} />
      <Divider sx={{ my: 1 }} />

      <ActorRoundBars actorRound={actorRound} />
      <Divider sx={{ my: 1 }} />

      <ActorRoundAttacks actorRound={actorRound} />
      <Divider sx={{ my: 1 }} />

      <ActorRoundEffects actorRound={actorRound} onChange={handleEffectsChange} />

      <Divider sx={{ my: 1 }} />

      <Box sx={{ mt: 1 }}>
        <Box component="pre" sx={{ maxHeight: 200, overflow: 'auto', fontSize: 12 }}>
          {JSON.stringify(actorRound, null, 2)}
        </Box>
      </Box>
    </Paper>
  );
};

export default ActorRoundView;
