import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogTitle, DialogContent, IconButton, Avatar, Box, Stack, Typography } from '@mui/material';
import ActorRoundView from '../../actor-round/ActorRoundView';
import { ActorRound } from '../../api/actor-rounds.dto';

const ActorRoundViewDialog: FC<{
  open: boolean;
  actorRound?: ActorRound | null;
  onClose: () => void;
}> = ({ open, actorRound, onClose }) => {
  const navigate = useNavigate();

  const handleCharacterClick = () => {
    if (actorRound.actorId) {
      navigate(`/strategic/characters/view/${actorRound.actorId}`);
    }
  };

  if (!actorRound) return <p>Loading...</p>;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl" aria-labelledby="actor-round-view-dialog">
      <DialogTitle id="actor-round-view-dialog">
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={actorRound.imageUrl || '/static/images/races/unknown.png'}
            sx={{ width: 100, height: 100, cursor: 'pointer' }}
            onClick={handleCharacterClick}
            variant="square"
          />
          <Box>
            <Typography variant="h6">{actorRound.actorName}</Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }} size="large">
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>{actorRound ? <ActorRoundView actorRound={actorRound} /> : null}</DialogContent>
    </Dialog>
  );
};

export default ActorRoundViewDialog;
