import React, { FC, useState } from 'react';
import { IconButton, Paper } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { ActorRound } from '../../api/actor-rounds.dto';
import DeclareInitiativeDialog from './DeclareInitiativeDialog';

const ActorRoundInitiative: FC<{
  actorRound: ActorRound;
}> = ({ actorRound }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Paper
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 0.5,
        width: '100%',
        height: '100%',
        flex: 1,
      }}
      elevation={0}
    >
      <IconButton onClick={() => setDialogOpen(true)}>
        <Avatar src={`/static/images/generic/initiative.png`} sx={{ width: 50, height: 50 }} />
      </IconButton>
      <DeclareInitiativeDialog open={dialogOpen} setOpen={setDialogOpen} actorRound={actorRound} />
      {actorRound.initiative?.roll && <div>{actorRound.initiative.total}</div>}
    </Paper>
  );
};

export default ActorRoundInitiative;
