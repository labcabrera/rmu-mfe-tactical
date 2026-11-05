import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Box, Button, Chip, Stack, TextField, Typography } from '@mui/material';
import { ChipRow, CriticalAlertRoll, D100, RmuDialog, RollField } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { resolveAlert, rollCriticalAlert } from '../../api/actor-rounds';
import { ActorRound, ActorRoundAlert } from '../../api/actor-rounds.dto';
import { criticalCode } from '../../services/action-service';
import { useTacticalNotify } from '../../services/notify-service';
import { canManageTactical } from '../../shared/permissions';

/** A critical table code: a letter, then letters, digits or dashes (S, K, P, Heat...). */
const CRITICAL_TYPE_PATTERN = /^[A-Za-z][\w-]*$/;

/**
 * A pending critical alert (workspace spec 077, decision D3): the critical of a fumble, of a movement or percent
 * maneuver gone wrong, of the heat of a cauterization or of a hazard. The game master or the owner of the actor types
 * its roll and the API applies it (hits, injuries, effects) and closes the alert; the critical of a fumble also needs
 * the table its text names. The game master may still dismiss it without rolling.
 */
const CriticalAlertDialog: FC<{
  actorRound: ActorRound;
  alert: ActorRoundAlert;
  open: boolean;
  onClose: () => void;
}> = ({ actorRound, alert, open, onClose }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const { game, updateActorRound } = useContext(CombatContext)!;
  const modifier = (key: string) => alert.modifiers?.find((each) => each.key === key)?.modifier ?? undefined;
  const origin = modifier('origin') ?? null;
  const knownType = modifier('criticalType');
  const severity = modifier('criticalSeverity') ?? '';
  const [roll, setRoll] = useState<number | null>(null);
  const [criticalType, setCriticalType] = useState(knownType ?? '');
  const [busy, setBusy] = useState(false);
  const [rolled, setRolled] = useState<CriticalAlertRoll | undefined>();
  const typeValid = !!knownType || CRITICAL_TYPE_PATTERN.test(criticalType.trim());
  const pending = alert.status === 'pending' || !alert.status;

  const run = (request: Promise<ActorRound>, after: (updated: ActorRound) => void) => {
    setBusy(true);
    request
      .then((updated) => {
        updateActorRound(updated);
        after(updated);
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };
  const rollCritical = () => {
    if (roll === null) return;
    run(
      rollCriticalAlert(
        actorRound.id,
        alert.id,
        { roll, ...(knownType ? {} : { criticalType: criticalType.trim().toUpperCase() }) },
        auth
      ),
      (updated) => {
        setRolled(updated.lastCriticalRoll);
        notify.success(t('critical-alert-rolled', { key: updated.lastCriticalRoll?.criticalKey ?? '' }));
      }
    );
  };
  const dismiss = () => run(resolveAlert(actorRound.id, alert.id, auth), () => onClose());

  const description =
    origin === 'fumble' || modifier('attackName')
      ? t('alert-critical-fumble', { severity, attack: modifier('attackName') ?? '' })
      : t('alert-critical-text', {
          code: criticalCode(knownType, severity),
          origin: t(`critical-alert-origin-${origin ?? 'other'}`),
        });

  return (
    <RmuDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      title={t('alert-critical')}
      subtitle={actorRound.actorName}
      buttons={
        rolled || !pending
          ? [
              <Button key="close" variant="contained" onClick={onClose}>
                {t('close')}
              </Button>,
            ]
          : [
              <Button key="cancel" onClick={onClose}>
                {t('cancel')}
              </Button>,
              ...(game && canManageTactical(game)
                ? [
                    <Button key="dismiss" color="inherit" disabled={busy} onClick={dismiss}>
                      {t('dismiss')}
                    </Button>,
                  ]
                : []),
              <Button
                key="roll"
                variant="contained"
                color="error"
                disabled={busy || roll === null || !typeValid}
                onClick={rollCritical}
              >
                {t('critical-alert-apply')}
              </Button>,
            ]
      }
    >
      <Stack spacing={2}>
        <Typography>{description}</Typography>
        {rolled ? (
          <Stack spacing={1}>
            <ChipRow>
              <Chip color="error" label={rolled.criticalKey} />
              {rolled.location && <Chip variant="outlined" label={t(rolled.location)} />}
              {rolled.damage > 0 && (
                <Chip variant="outlined" label={t('hazard-critical-damage', { damage: rolled.damage })} />
              )}
            </ChipRow>
            {rolled.text && (
              <Typography variant="body2" color="text.secondary">
                {rolled.text}
              </Typography>
            )}
          </Stack>
        ) : pending ? (
          <Stack spacing={1.5}>
            {!knownType && (
              <TextField
                size="small"
                label={t('critical-alert-type')}
                helperText={t('critical-alert-type-help')}
                value={criticalType}
                onChange={(e) => setCriticalType(e.target.value)}
                error={criticalType !== '' && !typeValid}
                sx={{ maxWidth: 240 }}
              />
            )}
            <Box sx={{ maxWidth: 320 }}>
              <RollField
                spec={D100}
                label={t('critical-roll')}
                value={roll}
                onChange={(value) => setRoll(value.total)}
                onClear={() => setRoll(null)}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {t('critical-alert-help')}
            </Typography>
          </Stack>
        ) : (
          <Alert severity="info" variant="outlined">
            {t('critical-alert-resolved')}
          </Alert>
        )}
      </Stack>
    </RmuDialog>
  );
};

export default CriticalAlertDialog;
