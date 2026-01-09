import React, { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Paper,
  Divider,
  Box,
  CircularProgress,
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';
import { useError } from '../../ErrorContext';
import { fetchActorRound } from '../api/actor-rounds';
import { ActorRound } from '../api/actor-rounds.dto';
import ActorRoundActions from './ActorRoundActions';
import ActorRoundAttacks from './ActorRoundAttacks';
import ActorRoundBars from './ActorRoundBars';
import ActorRoundEffects from './ActorRoundEffects';
import ActorRoundHeader from './ActorRoundHeader';

const ActorRoundView: FC = () => {
  const { actorRoundId } = useParams<{ actorRoundId?: string }>();
  const [actorRound, setActorRound] = useState<ActorRound | undefined>(undefined);
  const { showError } = useError();

  useEffect(() => {
    fetchActorRound(actorRoundId)
      .then((response) => setActorRound(response))
      .catch((err) => showError(err.message));
  }, [actorRoundId]);

  if (!actorRound) return <CircularProgress size={24} />;

  return (
    <>
      <ActorRoundActions actorRound={actorRound} />
      <Paper sx={{ p: 2 }} elevation={1}>
        <ActorRoundHeader actorRound={actorRound} />
        <Divider sx={{ my: 1 }} />

        <ActorRoundBars actorRound={actorRound} setActorRound={setActorRound} />
        <Divider sx={{ my: 1 }} />

        <ActorRoundAttacks actorRound={actorRound} />
        <Divider sx={{ my: 1 }} />

        <ActorRoundEffects actorRound={actorRound} setActorRound={setActorRound} />

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
      </Paper>
    </>
  );
};

export default ActorRoundView;
