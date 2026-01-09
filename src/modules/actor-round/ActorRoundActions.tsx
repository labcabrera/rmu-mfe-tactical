import React, { FC } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Breadcrumbs, Link, Stack } from '@mui/material';
import { t } from 'i18next';
import { ActorRound } from '../api/actor-rounds.dto';
import PlayButton from '../shared/buttons/PlayButton';

const ActorRoundActions: FC<{
  actorRound: ActorRound;
}> = ({ actorRound }) => {
  const navigate = useNavigate();

  const onPlay = async () => {
    navigate(`/tactical/combat/${actorRound.gameId}`);
  };

  return (
    <>
      <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
        <Box>
          <Breadcrumbs aria-label="breadcrumb">
            <Link color="primary" underline="hover" href="/">
              {t('home')}
            </Link>
            <Link component={RouterLink} color="primary" underline="hover" to="/tactical/games">
              {t('tactical')}
            </Link>
            <Link component={RouterLink} color="primary" underline="hover" to="/tactical/games">
              {t('actors')}
            </Link>
            <span>{actorRound.name}</span>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <PlayButton onClick={() => onPlay()} />
        </Stack>
      </Stack>
    </>
  );
};

export default ActorRoundActions;
