import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
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
import { isDevelopment } from '../services/action-service';
import ActorRoundAttacks from './ActorRoundAttacks';
import ActorRoundBars from './ActorRoundBars';
import ActorRoundDefenseMode from './ActorRoundDefenseMode';
import ActorRoundEffects from './ActorRoundEffects';
import ActorRoundHpLog from './ActorRoundHpLog';
import ActorRoundInjuries from './ActorRoundInjuries';
import ActorRoundItems from './ActorRoundItems';
import ActorRoundPenalty from './ActorRoundPenalty';

const ActorRoundView: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  const { t } = useTranslation();
  if (!actorRound) return <CircularProgress size={24} />;

  return (
    <Box>
      <ActorRoundBars actorRound={actorRound} />
      <Divider sx={{ my: 1 }} />

      <ActorRoundAttacks actorRound={actorRound} />
      <Divider sx={{ my: 1 }} />

      <ActorRoundDefenseMode actorRound={actorRound} />
      <Divider sx={{ my: 1 }} />

      <ActorRoundItems actorRound={actorRound} />
      <Divider sx={{ my: 1 }} />

      <ActorRoundInjuries actorRound={actorRound} />
      <Divider sx={{ my: 1 }} />

      <ActorRoundHpLog actorRound={actorRound} />
      <Divider sx={{ my: 1 }} />

      <ActorRoundPenalty actorRound={actorRound} />
      <Divider sx={{ my: 1 }} />

      <ActorRoundEffects actorRound={actorRound} />
      <Divider sx={{ my: 1 }} />

      {isDevelopment && (
        <Box sx={{ mt: 1 }}>
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography component="span">{t('details')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <pre>{JSON.stringify(actorRound, null, 2)}</pre>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}
    </Box>
  );
};

export default ActorRoundView;
