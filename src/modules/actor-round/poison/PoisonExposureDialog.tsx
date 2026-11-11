import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Stack, Typography } from '@mui/material';
import {
  isPoisonDataValid,
  PoisonData,
  PoisonDataFields,
  RmuDialog,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { createActorPoisoning } from '../../api/actor-rounds';
import { ActorRound } from '../../api/actor-rounds.dto';
import { useCombatActions } from '../../combat/combat-context';
import { useCatalogCategory } from './usePoisonCatalog';

/** A poison reaches the actor (spec 042): the game master picks it, and it waits for its RR. */
const PoisonExposureDialog: FC<{ actorRound: ActorRound; open: boolean; onClose: () => void }> = ({
  actorRound,
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const { updateActorRound } = useCombatActions();
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
