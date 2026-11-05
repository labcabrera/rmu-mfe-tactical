import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Button, Chip, Stack, Typography } from '@mui/material';
import { ChipRow, MentalFocusOutcome, RmuDialog, RuleHint } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { focusLabel } from '../../actor-round/ActorRoundConcentration';
import { resolveAlert } from '../../api/actor-rounds';
import { ActorRound, ActorRoundAlert } from '../../api/actor-rounds.dto';
import { useTacticalNotify } from '../../services/notify-service';

/** Alerts of workspace spec 077 resolved with the outcome of a Mental Focus maneuver. */
export const MENTAL_FOCUS_ALERT = 'mental-focus';

/**
 * Mental Focus alert (workspace spec 077, decision A2.4): the actor concentrates on two things, is stunned while
 * concentrating, or has held a focus for long. The game master rolls the maneuver by hand and marks the outcome: a
 * failure breaks every concentration of the actor.
 */
const MentalFocusAlertDialog: FC<{
  actorRound: ActorRound;
  alert: ActorRoundAlert;
  open: boolean;
  onClose: () => void;
}> = ({ actorRound, alert, open, onClose }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const { updateActorRound } = useContext(CombatContext)!;
  const [busy, setBusy] = useState(false);
  const modifierOf = (key: string) => alert.modifiers?.find((modifier) => modifier.key === key);
  const reason = modifierOf('reason')?.modifier ?? 'double';
  const rounds = modifierOf('rounds')?.value ?? 0;
  const foci = actorRound.concentration ?? [];

  const resolve = (outcome: MentalFocusOutcome) => {
    setBusy(true);
    resolveAlert(actorRound.id, alert.id, auth, outcome)
      .then((updated) => {
        updateActorRound(updated);
        notify.success(t(`mental-focus-${outcome}`));
        onClose();
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  return (
    <RmuDialog
      open={open}
      onDismiss={onClose}
      maxWidth="sm"
      title={t('alert-mental-focus')}
      subtitle={actorRound.actorName}
      buttons={[
        <Button key="cancel" onClick={onClose}>
          {t('cancel')}
        </Button>,
        <Button key="failed" color="error" variant="outlined" disabled={busy} onClick={() => resolve('failed')}>
          {t('mental-focus-failed')}
        </Button>,
        <Button key="passed" color="success" variant="contained" disabled={busy} onClick={() => resolve('passed')}>
          {t('mental-focus-passed')}
        </Button>,
      ]}
    >
      <Stack spacing={2}>
        <Alert severity="warning">{t(`alert-mental-focus-text-${reason}`, { rounds })}</Alert>
        {foci.length > 0 && (
          <ChipRow>
            {foci.map((focus, index) => (
              <Chip key={`${focus.kind}-${index}`} size="small" variant="outlined" label={focusLabel(focus, t)} />
            ))}
          </ChipRow>
        )}
        <RuleHint title={t('alert-mental-focus')} description={t('concentration-help')} reference="§8.1">
          <Typography variant="body2" color="text.secondary">
            {t('alert-mental-focus-help')}
          </Typography>
        </RuleHint>
      </Stack>
    </RmuDialog>
  );
};

export default MentalFocusAlertDialog;
