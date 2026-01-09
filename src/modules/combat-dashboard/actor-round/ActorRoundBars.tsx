import React, { FC } from 'react';
import { Stack, Typography } from '@mui/material';
import { ActorRound } from '../../api/actor-rounds.dto';
import GenericBar from '../../shared/generic/GenericBar';
import InitiativeBar from '../../shared/generic/InitiativeBar';

const barSize = 160;

const ActorRoundBars: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      <Typography variant="subtitle2">HP / Power / Fatigue</Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <GenericBar current={actorRound.hp?.current ?? 0} max={actorRound.hp?.max ?? 0} title="HP" width={barSize} />
        {actorRound.power && actorRound.power.max > 0 && (
          <GenericBar current={actorRound.power.current} max={actorRound.power.max} title="PWR" width={barSize} />
        )}
        <GenericBar current={Math.round(actorRound.fatigue?.accumulator ?? 0)} max={100} title="FA" width={barSize} />
      </Stack>

      <Typography variant="subtitle2">Initiative</Typography>
      <InitiativeBar current={actorRound.initiative?.total ?? 0} max={30} />
    </Stack>
  );
};

export default ActorRoundBars;
