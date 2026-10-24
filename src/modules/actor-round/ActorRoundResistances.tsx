import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { Button, Chip, Stack, Typography } from '@mui/material';
import { formatBonus } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../CombatContext';
import { ActorRound } from '../api/actor-rounds.dto';
import ResistanceRollDialog from './psychology/ResistanceRollDialog';

/** RR bonuses of the actor (copied from its character) and its fear RR in the current round (spec 022). */
const ActorRoundResistances: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  const { t } = useTranslation();
  const { game, displayRound } = useContext(CombatContext)!;
  const [open, setOpen] = useState(false);
  const currentRound = !!game && game.status === 'in_progress' && displayRound === game.round;
  const resistances = actorRound.resistances ?? [];

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">{t('resistances')}</Typography>
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
        {resistances.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('no-resistances')}
          </Typography>
        ) : (
          resistances.map((each) => (
            <Chip
              key={each.resistance}
              size="small"
              variant="outlined"
              label={`${t(each.resistance)} ${formatBonus(each.totalBonus)}`}
            />
          ))
        )}
        {currentRound && (
          <Button size="small" startIcon={<PsychologyIcon />} onClick={() => setOpen(true)}>
            {t('fear-rr')}
          </Button>
        )}
      </Stack>
      <ResistanceRollDialog actorRound={actorRound} open={open} onClose={() => setOpen(false)} />
    </Stack>
  );
};

export default ActorRoundResistances;
