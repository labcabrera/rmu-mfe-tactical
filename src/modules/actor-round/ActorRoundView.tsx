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
import { ActorRound } from '../api/actor-rounds.dto';
import ActorRoundActions from './ActorRoundActions';
import ActorRoundAttacks from './ActorRoundAttacks';
import ActorRoundBars from './ActorRoundBars';
import ActorRoundEffects from './ActorRoundEffects';
import ActorRoundHeader from './ActorRoundHeader';

const ActorRoundView: FC<{
  actorRound?: ActorRound;
  onChange?: (next: ActorRound) => void;
}> = ({ actorRound: actorRoundProp, onChange }) => {
  const { actorRoundId } = useParams();
  const [actorRound, setActorRound] = useState<ActorRound | undefined>(actorRoundProp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('ActorRoundView: useEffect triggered');
    if (actorRoundProp) {
      setActorRound(actorRoundProp);
      return;
    }
    const id = actorRoundId as string | undefined;
    if (!id) {
      setError('No actorRound id provided');
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${process.env.RMU_API_TACTICAL_URL}/actor-rounds/${id}`;
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) {
          throw new Error(`${res.status} ${res.statusText}`);
        }
        const json = await res.json();
        if (!cancelled) {
          setActorRound(json as ActorRound);
          if (onChange) onChange(json as ActorRound);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load actorRound');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [actorRoundProp, actorRoundId, onChange]);

  if (loading) return <CircularProgress size={24} />;
  if (error)
    return (
      <Paper sx={{ p: 2 }} elevation={1}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  if (!actorRound)
    return (
      <Paper sx={{ p: 2 }} elevation={1}>
        <Typography>No actor round available</Typography>
      </Paper>
    );

  return (
    <>
      <ActorRoundActions actorRound={actorRound} />
      <Paper sx={{ p: 2 }} elevation={1}>
        <ActorRoundHeader actorRound={actorRound} />
        <Divider sx={{ my: 1 }} />

        <ActorRoundBars actorRound={actorRound} />
        <Divider sx={{ my: 1 }} />

        <ActorRoundAttacks actorRound={actorRound} />
        <Divider sx={{ my: 1 }} />

        <ActorRoundEffects actorRound={actorRound} setActorRound={setActorRound} />

        <Divider sx={{ my: 1 }} />

        <Box sx={{ mt: 1 }}>
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
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
