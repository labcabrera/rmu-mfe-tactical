/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Stack, Typography } from '@mui/material';
import { isPoisonDataValid, PoisonData, PoisonDataFields, RmuDialog } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { createActorPoisoning } from '../../api/actor-rounds';
import { ActorRound } from '../../api/actor-rounds.dto';
import { useTacticalNotify } from '../../services/notify-service';
import { useCatalogCategory } from './use-poison-catalog';

/** A poison reaches the actor (spec 042): the game master picks it, and it waits for its RR. */
const PoisonExposureDialog: FC<{ actorRound: ActorRound; open: boolean; onClose: () => void }> = ({
  actorRound,
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const { updateActorRound } = useContext(CombatContext)!;
  const catalog = useCatalogCategory('poison', open);
  const [poison, setPoison] = useState<PoisonData>();

  useEffect(() => {
    if (open) setPoison(undefined);
  }, [open]);

  const save = () => {
    if (!isPoisonDataValid(poison)) return;
    createActorPoisoning(actorRound.id, poison, auth)
      .then((result) => {
        updateActorRound(result.actorRound);
        onClose();
      })
      .catch(notify.error);
  };

  return (
    <RmuDialog
      open={open}
      title={t('poison-actor')}
      subtitle={actorRound.actorName}
      maxWidth="sm"
      onCancel={onClose}
      onConfirm={save}
      onConfirmDisabled={!isPoisonDataValid(poison)}
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <PoisonDataFields catalog={catalog} value={poison} onChange={setPoison} />
        <Typography variant="caption" color="text.secondary">
          {t('poison-exposure-help')}
        </Typography>
      </Stack>
    </RmuDialog>
  );
};

export default PoisonExposureDialog;
