import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogTitle, DialogContent, IconButton, Avatar, Box, Stack, Typography, Slide } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import ActorRoundView from '../../actor-round/ActorRoundView';
import { ActorRound } from '../../api/actor-rounds.dto';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl" slots={{ transition: Transition }}>
      <DialogTitle id="actor-round-view-dialog">
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Avatar
            src={actorRound?.imageUrl || '/static/images/races/unknown.png'}
            sx={{ width: 100, height: 100, cursor: actorRound ? 'pointer' : 'default' }}
            onClick={handleCharacterClick}
            variant="square"
          />
          <Box>
            <Typography variant="h6">{actorRound?.actorName || 'Actor Round'}</Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }} size="large">
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>
        {actorRound ? (
          <ActorRoundView key={actorRound.id} actorRound={actorRound} />
        ) : (
          <Typography>Loading...</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ActorRoundViewDialog;
