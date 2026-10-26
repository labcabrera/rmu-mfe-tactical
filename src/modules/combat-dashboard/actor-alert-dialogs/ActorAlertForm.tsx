import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Typography } from '@mui/material';
import { ActorRound, ActorRoundAlert } from '../../api/actor-rounds.dto';

/**
 * Form of an alert resolved locally. Endurance and breakage alerts have their own dialogs in `ActorAlertDialog`. A
 * critical alert (the critical of a fumble, spec 034) only tells the game master the critical to roll.
 */
const ActorAlertForm: FC<{
  actorRound: ActorRound;
  alertId: string;
  onChange?: (updated: ActorRoundAlert) => void;
}> = ({ actorRound, alertId }) => {
  const { t } = useTranslation();
  const alert = actorRound.alerts?.find((a) => a.id === alertId);

  if (!alert) return <div>{t('alert-not-found')}</div>;

  const modifier = (key: string) => alert.modifiers?.find((m) => m.key === key)?.modifier;

  switch (alert.type) {
    case 'critical':
      return (
        <Stack spacing={1}>
          <Typography>
            {t('alert-critical-fumble', {
              severity: modifier('criticalSeverity'),
              attack: modifier('attackName') ?? '',
            })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('alert-critical-fumble-help')}
          </Typography>
        </Stack>
      );
    default:
      return (
        <div>
          <p>{t('unsupported-alert-type', { type: alert.type })}</p>
        </div>
      );
  }
};

export default ActorAlertForm;
