import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Button, Chip, Stack, Typography } from '@mui/material';
import {
  BREATH_CHECK_ALERT,
  ChipRow,
  formatBonus,
  MentalFocusOutcome,
  RmuDialog,
  RuleHint,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { resolveAlert } from '../../api/actor-rounds';
import { ActorRound, ActorRoundAlert } from '../../api/actor-rounds.dto';
import { useTacticalNotify } from '../../services/notify-service';

export { BREATH_CHECK_ALERT };

/**
 * Breath check (workspace spec 079, C4, §15.2): the actor has held its breath past its limit. The game master rolls the
 * absolute Endurance maneuver by hand (Easy, a step harder each round; +25 with an active Adrenal Focus) and marks the
 * outcome: a failure starts the suffocation (1d10 hits per round; stunned -50 underwater).
 */
const BreathCheckAlertDialog: FC<{
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
  const difficulty = modifierOf('difficulty')?.modifier ?? 'e';
  const held = modifierOf('heldRounds')?.value ?? 0;
  const limit = modifierOf('limitRounds')?.value ?? 0;
  const adrenal = modifierOf('adrenal-focus')?.value ?? 0;

  const resolve = (outcome: MentalFocusOutcome) => {
    setBusy(true);
    resolveAlert(actorRound.id, alert.id, auth, outcome)
      .then((updated) => {
        updateActorRound(updated);
        notify.success(t(`breath-check-${outcome}`));
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
      title={t('alert-breath-check')}
      subtitle={actorRound.actorName}
      buttons={[
        <Button key="cancel" onClick={onClose}>
          {t('cancel')}
        </Button>,
        <Button key="failed" color="error" variant="outlined" disabled={busy} onClick={() => resolve('failed')}>
          {t('breath-check-failed')}
        </Button>,
        <Button key="passed" color="success" variant="contained" disabled={busy} onClick={() => resolve('passed')}>
          {t('breath-check-passed')}
        </Button>,
      ]}
    >
      <Stack spacing={2}>
        <Alert severity="warning">{t('alert-breath-check-text', { held, limit })}</Alert>
        <ChipRow>
          <Chip
            size="small"
            color="warning"
            label={t('breath-check-difficulty', { difficulty: t(`difficulty-${difficulty}`) })}
          />
          {adrenal > 0 && (
            <Chip
              size="small"
              variant="outlined"
              color="success"
              label={t('breath-check-adrenal', { value: formatBonus(adrenal) })}
            />
          )}
        </ChipRow>
        <RuleHint title={t('alert-breath-check')} description={t('breath-check-help')} reference="§15.2">
          <Typography variant="body2" color="text.secondary">
            {t('breath-check-help')}
          </Typography>
        </RuleHint>
      </Stack>
    </RmuDialog>
  );
};

export default BreathCheckAlertDialog;
