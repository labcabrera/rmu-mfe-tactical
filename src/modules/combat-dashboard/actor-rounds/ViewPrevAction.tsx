import React, { FC, useState } from 'react';
import { Avatar } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { Action } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';
import ActionDialog from '../action-dialogs/ActionDialog';

const ViewPrevAction: FC<{
  activeAction: Action;
  actorRound: ActorRound;
  phase: number;
}> = ({ activeAction, actorRound, phase }) => {
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);

  if (!activeAction) return <p>Loading...</p>;

  if (activeAction.phaseEnd === phase) {
    return (
      <>
        <ActionDialog
          action={activeAction}
          actorRound={actorRound}
          open={resolveDialogOpen}
          onClose={() => setResolveDialogOpen(false)}
        />
        <Avatar src={`/static/images/actions/${activeAction.actionType}.png`} sx={{ width: 55, height: 55 }}></Avatar>
        <IconButton onClick={() => setResolveDialogOpen(true)}>
          <Avatar src="/static/images/actions/perception.png" sx={{ width: 55, height: 55 }}></Avatar>
        </IconButton>
      </>
    );
  }

  return (
    <Stack direction="row">
      <Avatar src={`/static/images/actions/${activeAction.actionType}.png`} sx={{ width: 55, height: 55 }}></Avatar>
    </Stack>
  );
};

export default ViewPrevAction;
