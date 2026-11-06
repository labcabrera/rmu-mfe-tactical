import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { BodySide, RmuDialog, RuleHint } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { resolveAlert } from '../../api/actor-rounds';
import { ActorRound, ActorRoundAlert } from '../../api/actor-rounds.dto';
import { useTacticalNotify } from '../../services/notify-service';

/** Alert of a limb that may be lost (workspace spec 068 tourniquet; spec 079, C1 critical). */
export const LIMB_LOSS_ALERT = 'limb-loss';

const SIDES: BodySide[] = ['left', 'right'];

/**
 * Confirm limb loss (workspace spec 079, C1): a tourniquet left too long or a critical flagged limb-loss may cost the
 * actor the limb. The API never takes it by itself: the game master confirms the loss (an arm is useless for good, a
 * leg leaves the actor crawling; the side is asked when the injury has none) or dismisses the alert.
 */
const LimbLossAlertDialog: FC<{
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
  const modifier = (key: string) => alert.modifiers?.find((each) => each.key === key)?.modifier ?? undefined;
  const injury = actorRound.injuries?.find((each) => each.id === modifier('injuryId'));
  const location = modifier('location') ?? injury?.location;
  const knownSide = (modifier('side') ?? injury?.side) as BodySide | undefined;
  const [side, setSide] = useState<BodySide>(knownSide ?? 'left');
  const origin = modifier('origin') ?? 'tourniquet';
  const limb = location === 'arm' || location === 'leg' ? location : undefined;

  const resolve = (confirmed: boolean) => {
    setBusy(true);
    resolveAlert(actorRound.id, alert.id, auth, confirmed ? 'confirmed' : undefined, confirmed ? side : undefined)
      .then((updated) => {
        updateActorRound(updated);
        notify.success(t(confirmed ? 'limb-loss-confirmed' : 'limb-loss-dismissed'));
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
      title={t('limb-loss-confirm-title')}
      subtitle={actorRound.actorName}
      buttons={[
        <Button key="cancel" onClick={onClose}>
          {t('cancel')}
        </Button>,
        <Button key="dismiss" color="inherit" disabled={busy} onClick={() => resolve(false)}>
          {t('dismiss')}
        </Button>,
        <Button key="confirm" color="error" variant="contained" disabled={busy || !limb} onClick={() => resolve(true)}>
          {t('limb-loss-confirm')}
        </Button>,
      ]}
    >
      <Stack spacing={2}>
        <Alert severity="error">
          {t(`limb-loss-origin-${origin}`, {
            injury: injury ? t(`injury-type-${injury.type}`) : t('injury'),
            rounds: alert.modifiers?.find((each) => each.key === 'rounds')?.value ?? 0,
          })}
        </Alert>
        {!limb && <Alert severity="warning">{t('err-limb-loss-location')}</Alert>}
        {limb && !knownSide && (
          <TextField
            select
            label={t('limb-side')}
            value={side}
            onChange={(event) => setSide(event.target.value as BodySide)}
            sx={{ maxWidth: 240 }}
          >
            {SIDES.map((value) => (
              <MenuItem key={value} value={value}>
                {t(`side-${value}`)}
              </MenuItem>
            ))}
          </TextField>
        )}
        {limb && (
          <RuleHint title={t('limb-loss-confirm-title')} description={t(`lost-limb-${limb}-help`)} reference="§13.1">
            <Typography variant="body2" color="text.secondary">
              {t('limb-loss-confirm-help', {
                limb: t('lost-limb-label', { location: t(limb), side: t(`side-${knownSide ?? side}`) }),
              })}
            </Typography>
          </RuleHint>
        )}
      </Stack>
    </RmuDialog>
  );
};

export default LimbLossAlertDialog;
