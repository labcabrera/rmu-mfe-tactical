import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography } from '@mui/material';
import { RmuDialog } from '@labcabrera-rmu/rmu-react-shared-lib';
import ActorRoundView from '../../actor-round/ActorRoundView';
import { ActorRound } from '../../api/actor-rounds.dto';

const ActorRoundViewDialog: FC<{
  open: boolean;
  actorRound?: ActorRound | null;
  onClose: () => void;
}> = ({ open, actorRound, onClose }) => {
  const navigate = useNavigate();

  const handleCharacterClick = () => {
    if (actorRound?.actorId) {
      navigate(`/strategic/characters/view/${actorRound.actorId}`);
    }
  };

  return (
    <RmuDialog
      title={actorRound?.actorName || 'Actor Round'}
      avatarImg={actorRound?.imageUrl || '/static/images/races/unknown.png'}
      open={open}
      onClose={onClose}
      maxWidth="xl"
      buttons={
        <>
          {actorRound?.actorId && <Button onClick={handleCharacterClick}>View character</Button>}
        </>
      }
    >
      {actorRound ? <ActorRoundView key={actorRound.id} actorRound={actorRound} /> : <Typography>Loading...</Typography>}
    </RmuDialog>
  );
};

export default ActorRoundViewDialog;
