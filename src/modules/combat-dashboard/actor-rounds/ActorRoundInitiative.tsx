import React, { FC, useState } from 'react';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import { IconButton, Paper, Stack, Typography } from '@mui/material';
import { ActorRound } from '../../api/actor-rounds.dto';
import InitiativeBar from '../../shared/generic/InitiativeBar';
import DeclareInitiativeDialog from './DeclareInitiativeDialog';

const ActorRoundInitiative: FC<{
  actorRound: ActorRound;
}> = ({ actorRound }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Paper
      sx={{
        // display: 'flex',
        // alignItems: 'left',
        width: '100%',
        height: '100%',
        padding: 2,
        // flex: 1,
      }}
      elevation={0}
    >
      <Stack direction="column" alignItems="center" spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body1" color="text.primary">
            {actorRound.initiative.total}
          </Typography>
          <IconButton onClick={() => setDialogOpen(true)} size="small" color="primary">
            <ElectricBoltIcon />
          </IconButton>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {actorRound.initiative.base} + {actorRound.initiative.penalty}
          {actorRound.initiative.roll && <> {' + ' + actorRound.initiative.roll} </>}
        </Typography>
        <DeclareInitiativeDialog open={dialogOpen} setOpen={setDialogOpen} actorRound={actorRound} />
        {actorRound.initiative?.roll && <InitiativeBar current={actorRound.initiative.total} max={30} width={100} />}
      </Stack>
    </Paper>
  );
};

export default ActorRoundInitiative;
