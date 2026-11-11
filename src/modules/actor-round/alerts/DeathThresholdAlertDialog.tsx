import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Button, Stack, Typography } from '@mui/material';
import { PENALTY_DEATH_THRESHOLD, RmuDialog, RuleHint, useApiNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import { resolveAlert } from '../../api/actor-rounds';
import { ActorRound, ActorRoundAlert } from '../../api/actor-rounds.dto';
import { useCombatActions } from '../../combat/combat-context';
import { useBusyAction } from '../../hooks/useBusyAction';

/** Alert of workspace spec 079 for total penalties of -300 or worse. */
export const DEATH_THRESHOLD_ALERT = 'death-threshold';

/**
 * Death by the total penalties (workspace spec 079, decision A3; §9.8 Penalties): from -300 the actor dies in the
 * upkeep. The API never applies it by itself: the game master confirms the death or dismisses the alert.
 */
const DeathThresholdAlertDialog: FC<{
  actorRound: ActorRound;
  alert: ActorRoundAlert;
  open: boolean;
  onClose: () => void;
}> = ({ actorRound, alert, open, onClose }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const { updateActorRound } = useCombatActions();
  const { busy, run } = useBusyAction();
  const total = alert.modifiers?.find((modifier) => modifier.key === 'total')?.value ?? PENALTY_DEATH_THRESHOLD;

  const resolve = (confirmed: boolean) => {
    run(
      resolveAlert(actorRound.id, alert.id, auth, confirmed ? 'confirmed' : undefined).then((updated) => {
        updateActorRound(updated);
        notify.success(t(confirmed ? 'death-threshold-confirmed' : 'death-threshold-dismissed'));
        onClose();
      })
    );
  };

  return (
    <RmuDialog
      open={open}
      onDismiss={onClose}
      maxWidth="sm"
      title={t('alert-death-threshold')}
      subtitle={actorRound.actorName}
      buttons={[
        <Button key="cancel" onClick={onClose}>
          {t('cancel')}
        </Button>,
        <Button key="dismiss" color="inherit" disabled={busy} onClick={() => resolve(false)}>
          {t('dismiss')}
        </Button>,
        <Button key="confirm" color="error" variant="contained" disabled={busy} onClick={() => resolve(true)}>
          {t('death-threshold-confirm')}
        </Button>,
      ]}
    >
      <Stack spacing={2}>
        <Alert severity="error">{t('alert-death-threshold-text', { total })}</Alert>
        <RuleHint title={t('alert-death-threshold')} description={t('penalty-thresholds-help')} reference="§9.8">
          <Typography variant="body2" color="text.secondary">
            {t('alert-death-threshold-help')}
          </Typography>
        </RuleHint>
      </Stack>
    </RmuDialog>
  );
};

export default DeathThresholdAlertDialog;
