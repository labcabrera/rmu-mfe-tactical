import React, { FC, useState } from 'react';
import { Avatar } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { Action } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';
import type { Character } from '../../api/characters';
import ResolveActionDialog from '../resolve-action-dialog/ResolveActionDialog';

const ViewPrevAction: FC<{
  activeAction: Action;
  actorRound: ActorRound;
  character: Character;
  phase: number;
}> = ({ activeAction, actorRound, character, phase }) => {
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);

  if (!activeAction) return <p>Loading...</p>;

  if (activeAction.phaseEnd === phase) {
    return (
      <>
        <ResolveActionDialog
          action={activeAction}
          actorRound={actorRound}
          character={character}
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
