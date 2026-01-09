import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Typography, Avatar } from '@mui/material';
import { ActorRound } from '../api/actor-rounds.dto';

const ActorRoundHeader: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  const navigate = useNavigate();

  const handleCharacterClick = () => {
    if (actorRound.actorId) {
      navigate(`/strategic/characters/view/${actorRound.actorId}`);
    }
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Avatar
        src={actorRound.imageUrl || '/static/images/races/unknown.png'}
        sx={{ width: 72, height: 72 }}
        onClick={handleCharacterClick}
      />
      <Box>
        <Typography variant="h6">{actorRound.actorName}</Typography>
      </Box>
    </Stack>
  );
};

export default ActorRoundHeader;
