import React, { FC } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Divider,
  Box,
  CircularProgress,
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';
import { ActorRound } from '../api/actor-rounds.dto';
import ActorRoundAttacks from './ActorRoundAttacks';
import ActorRoundBars from './ActorRoundBars';
import ActorRoundEffects from './ActorRoundEffects';

const ActorRoundView: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  if (!actorRound) return <CircularProgress size={24} />;

  return (
    <Box>
      <ActorRoundBars actorRound={actorRound} />
      <Divider sx={{ my: 1 }} />

      <ActorRoundAttacks actorRound={actorRound} />
      <Divider sx={{ my: 1 }} />

      <ActorRoundEffects actorRound={actorRound} />

      <Divider sx={{ my: 1 }} />

      <Box sx={{ mt: 1 }}>
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography component="span">Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <pre>{JSON.stringify(actorRound, null, 2)}</pre>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default ActorRoundView;
