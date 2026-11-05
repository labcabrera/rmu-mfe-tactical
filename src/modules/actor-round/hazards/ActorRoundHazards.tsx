import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import LandslideIcon from '@mui/icons-material/Landslide';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import { HazardKind, RuleHint, SectionLabel } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { ActorRound } from '../../api/actor-rounds.dto';
import { isRoundEditable } from '../../services/game-service';
import { canManageTactical } from '../../shared/permissions';
import HazardDialog from './HazardDialog';
import HazardResult, { hazardTitle } from './HazardResult';

/**
 * Falls and falling objects of an actor in the side panel (workspace spec 077, decision D2): the game master resolves
 * one with "Fall" or "Falling object", and the ones of this round are listed with their result. Nothing for the other
 * players when the actor took none.
 */
const ActorRoundHazards: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  const { t } = useTranslation();
  const { game, displayRound } = useContext(CombatContext)!;
  const [kind, setKind] = useState<HazardKind | null>(null);
  const hazards = actorRound.hazards ?? [];
  const manage = !!game && canManageTactical(game) && isRoundEditable(game, displayRound);
  if (!manage && hazards.length === 0) return null;

  // The panel separates its sections: this one brings its own divider, as it is not always there
  return (
    <>
      <Stack spacing={1}>
        <RuleHint title={t('hazards')} description={t('hazards-help')} reference="§15.4">
          <SectionLabel>{t('hazards')}</SectionLabel>
        </RuleHint>
        {manage && (
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
            <Button size="small" variant="outlined" startIcon={<ArrowDownwardIcon />} onClick={() => setKind('fall')}>
              {t('hazard-kind-fall')}
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<LandslideIcon />}
              onClick={() => setKind('falling-object')}
            >
              {t('hazard-kind-falling-object')}
            </Button>
          </Stack>
        )}
        {hazards.map((hazard) => (
          <Box key={hazard.id} sx={{ borderLeft: 3, borderColor: 'error.main', pl: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {hazardTitle(hazard, t)}
            </Typography>
            <HazardResult hazard={hazard} />
          </Box>
        ))}
        {kind && <HazardDialog actorRound={actorRound} kind={kind} open onClose={() => setKind(null)} />}
      </Stack>
      <Divider />
    </>
  );
};

export default ActorRoundHazards;
