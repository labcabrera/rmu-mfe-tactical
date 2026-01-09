import React, { FC } from 'react';
import { Box, Stack, Typography, Avatar } from '@mui/material';
import { ActorRound } from '../../api/actor-rounds.dto';

const ActorRoundHeader: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Avatar src={actorRound.imageUrl || '/static/images/races/unknown.png'} sx={{ width: 72, height: 72 }} />
      <Box>
        <Typography variant="h6">{actorRound.actorName}</Typography>
        <Typography variant="body2" color="text.secondary">
          Id: {actorRound.actorId} · Game: {actorRound.gameId}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Phase start: {actorRound.phaseStart}
        </Typography>
      </Box>
    </Stack>
  );
};

export default ActorRoundHeader;
