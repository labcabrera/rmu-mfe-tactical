import React, { FC, useState } from 'react';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import { IconButton, Card, CardContent, Stack, Typography } from '@mui/material';
import { ActorRound } from '../../../api/actor-rounds.dto';
import { imageBaseUrl } from '../../../services/config';
import InitiativeBar from '../../../shared/generic/InitiativeBar';
import DeclareInitiativeDialog from './DeclareInitiativeDialog';

const ActorRoundInitiative: FC<{
  actorRound: ActorRound;
}> = ({ actorRound }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const isDead = actorRound.effects.some((e) => e.status === 'dead');

  const bgUrl = `${imageBaseUrl}images/backgrounds/bg-initiative-02.png`;

  return (
    <Card
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'stretch',
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        bgcolor: 'transparent',
      }}
      elevation={0}
    >
      {!isDead && (
        <CardContent sx={{ width: '100%', p: 2 }}>
          <Stack direction="column" alignItems="center" spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body1" color="text.primary">
                {actorRound.initiative.total}
              </Typography>
              <IconButton onClick={() => setDialogOpen(true)} size="small" color="primary">
                <ElectricBoltIcon />
              </IconButton>
            </Stack>
            {!actorRound.initiative.total && <Typography>Not declared</Typography>}
            <DeclareInitiativeDialog open={dialogOpen} setOpen={setDialogOpen} actorRound={actorRound} />
            {actorRound.initiative?.roll && (
              <InitiativeBar current={actorRound.initiative.total} max={30} width={100} />
            )}
          </Stack>
        </CardContent>
      )}
    </Card>
  );
};

export default ActorRoundInitiative;
