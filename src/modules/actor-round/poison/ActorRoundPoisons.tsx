import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import DeleteIcon from '@mui/icons-material/Delete';
import ScienceIcon from '@mui/icons-material/Science';
import { Button, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { EmptyState, Panel, PoisonExposure, SectionLabel } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { dismissActorPoisoning } from '../../api/actor-rounds';
import { ActorRound } from '../../api/actor-rounds.dto';
import { isRoundEditable } from '../../services/game-service';
import { useTacticalNotify } from '../../services/notify-service';
import PoisonExposureDialog from './PoisonExposureDialog';
import PoisonRrDialog from './PoisonRrDialog';

/**
 * Poisons that reached the actor and wait for their RR (spec 042): a coated weapon with a critical, or the game master
 * with "Poison". Each one takes its RR or is dropped; a failed RR becomes a poisoning among the injuries.
 */
const ActorRoundPoisons: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const { game, displayRound, updateActorRound } = useContext(CombatContext)!;
  const editable = isRoundEditable(game, displayRound);
  const [creating, setCreating] = useState(false);
  const [resolving, setResolving] = useState<PoisonExposure>();
  const exposures = actorRound.poisonExposures ?? [];
  if (!editable && exposures.length === 0) return null;

  const dismiss = (exposure: PoisonExposure) =>
    dismissActorPoisoning(actorRound.id, exposure.id, auth).then(updateActorRound).catch(notify.error);

  return (
    <Stack spacing={1}>
      <SectionLabel
        actions={
          editable && (
            <Button size="small" startIcon={<ScienceIcon />} onClick={() => setCreating(true)}>
              {t('poison-actor')}
            </Button>
          )
        }
      >
        {t('poison-exposures')}
      </SectionLabel>
      {exposures.length === 0 && <EmptyState dense title={t('poison-exposures-none')} />}
      {exposures.map((exposure) => (
        <Panel key={exposure.id} variant="outlined" dense>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <ScienceIcon fontSize="small" color="secondary" />
            <Stack sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {t(exposure.poison.name, exposure.poison.name)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {[
                  t('poison-summary-short', {
                    category: t(`poison-category-${exposure.poison.category}`),
                    level: exposure.poison.level,
                  }),
                  exposure.source.attackerName,
                  exposure.source.criticalKey,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Typography>
            </Stack>
            {editable && (
              <>
                <Button size="small" variant="outlined" onClick={() => setResolving(exposure)}>
                  {t('poison-rr')}
                </Button>
                <Tooltip title={t('poison-dismiss')}>
                  <IconButton size="small" aria-label={t('poison-dismiss')} onClick={() => dismiss(exposure)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Stack>
        </Panel>
      ))}
      <PoisonExposureDialog actorRound={actorRound} open={creating} onClose={() => setCreating(false)} />
      <PoisonRrDialog actorRound={actorRound} exposure={resolving} onClose={() => setResolving(undefined)} />
    </Stack>
  );
};

export default ActorRoundPoisons;
