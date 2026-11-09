import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Button, Chip, Stack, Typography } from '@mui/material';
import { ChipRow, HazardKind, RmuDialog, RuleHint } from '@labcabrera-rmu/rmu-react-shared-lib';
import { resolveAlert } from '../../api/actor-rounds';
import { ActorRound, ActorRoundAlert } from '../../api/actor-rounds.dto';
import { useCombatActions } from '../../combat/combat-context';
import { useBusyAction } from '../../hooks/useBusyAction';
import HazardDialog from '../hazards/HazardDialog';

/** Alert of workspace spec 079 raised by the `knocked_back_distance` effect of a critical. */
export const KNOCKED_BACK_ALERT = 'knocked-back';

/**
 * Knock-back (workspace spec 079, decision A4; §9.8 Knocked Back): a critical moved the actor some feet away. There is
 * no map: the game master asks for a maneuver to catch itself (Acrobatics or a Movement skill, difficulty of his
 * choice) and decides the direction and what it hits. It may resolve a fall or a hit against an object as a hazard,
 * whose critical is no worse than the one that knocked the actor back; that hazard closes the alert. Otherwise the alert
 * is dismissed.
 */
const KnockedBackAlertDialog: FC<{
  actorRound: ActorRound;
  alert: ActorRoundAlert;
  open: boolean;
  onClose: () => void;
}> = ({ actorRound, alert, open, onClose }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const { updateActorRound } = useCombatActions();
  const { busy, run } = useBusyAction();
  const [hazard, setHazard] = useState<HazardKind | null>(null);
  const modifierOf = (key: string) => alert.modifiers?.find((modifier) => modifier.key === key);
  const feet = modifierOf('feet')?.value ?? 0;
  const severityCap = modifierOf('severityCap')?.modifier ?? null;

  const dismiss = () => {
    run(
      resolveAlert(actorRound.id, alert.id, auth).then((updated) => {
        updateActorRound(updated);
        onClose();
      })
    );
  };

  if (hazard) {
    return (
      <HazardDialog
        actorRound={actorRound}
        kind={hazard}
        open={open}
        onClose={() => {
          setHazard(null);
          onClose();
        }}
        knockedBackAlertId={alert.id}
        initialDistance={feet}
        intro={
          <Alert severity="warning" variant="outlined">
            {t('alert-knocked-back-hazard-intro', { feet, severity: severityCap ?? 'A' })}
          </Alert>
        }
      />
    );
  }

  return (
    <RmuDialog
      open={open}
      onDismiss={onClose}
      maxWidth="sm"
      title={t('alert-knocked-back')}
      subtitle={actorRound.actorName}
      buttons={[
        <Button key="cancel" onClick={onClose}>
          {t('cancel')}
        </Button>,
        <Button key="fall" color="error" variant="outlined" disabled={busy} onClick={() => setHazard('fall')}>
          {t('knocked-back-fall')}
        </Button>,
        <Button
          key="object"
          color="error"
          variant="outlined"
          disabled={busy}
          onClick={() => setHazard('falling-object')}
        >
          {t('knocked-back-collision')}
        </Button>,
        <Button key="dismiss" variant="contained" disabled={busy} onClick={dismiss}>
          {t('dismiss')}
        </Button>,
      ]}
    >
      <Stack spacing={2}>
        <Alert severity="warning">{t('alert-knocked-back-text', { feet })}</Alert>
        <ChipRow>
          <Chip size="small" label={t('hazard-feet', { feet })} />
          {severityCap && (
            <Chip
              size="small"
              variant="outlined"
              color="warning"
              label={t('hazard-severity-cap', { severity: severityCap })}
            />
          )}
        </ChipRow>
        <RuleHint title={t('alert-knocked-back')} description={t('alert-knocked-back-help')} reference="§9.8">
          <Typography variant="body2" color="text.secondary">
            {t('alert-knocked-back-recovery')}
          </Typography>
        </RuleHint>
      </Stack>
    </RmuDialog>
  );
};

export default KnockedBackAlertDialog;
