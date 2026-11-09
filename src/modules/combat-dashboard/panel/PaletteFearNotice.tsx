import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import BackHandIcon from '@mui/icons-material/BackHand';
import { Alert, Button } from '@mui/material';
import { useApiNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import { dropActorRoundItems } from '../../api/actor-rounds';
import { ActorRound } from '../../api/actor-rounds.dto';
import { useCombatActions } from '../../combat/combat-context';
import { useBusyAction } from '../../hooks/useBusyAction';

/**
 * What the fear of the actor lets it declare (workspace spec 068, decision 14), and the "Drop items" of a broken actor:
 * what it holds in its hands falls (0 AP) and stays in its inventory.
 */
const PaletteFearNotice: FC<{ actorRound: ActorRound; fear: string; onDropped: () => void }> = ({
  actorRound,
  fear,
  onDropped,
}) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const { updateActorRound } = useCombatActions();
  const { busy: dropping, run } = useBusyAction();
  const held = (actorRound.items ?? []).some((item) => !!item.slot && !item.dropped);

  const drop = () => {
    run(
      dropActorRoundItems(actorRound.id, auth).then((updated) => {
        updateActorRound(updated);
        notify.success(t('drop-items-done'));
        onDropped();
      })
    );
  };

  return (
    <Alert
      severity="warning"
      variant="outlined"
      sx={{ mb: 1 }}
      action={
        fear === 'fear-broken' ? (
          <Button color="inherit" size="small" startIcon={<BackHandIcon />} onClick={drop} disabled={dropping || !held}>
            {t('drop-items')}
          </Button>
        ) : undefined
      }
    >
      {t(`palette-fear-${fear}`)}
    </Alert>
  );
};

export default PaletteFearNotice;
