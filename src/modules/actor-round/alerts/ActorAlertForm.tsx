import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Stack, Typography } from '@mui/material';
import { ActorRound, ActorRoundAlert } from '../../api/actor-rounds.dto';

/** An injury of the actor named by its type and location, for the alerts of workspace spec 068. */
const injuryName = (actorRound: ActorRound, injuryId: string | null | undefined, t: (key: string) => string) => {
  const injury = actorRound.injuries?.find((each) => each.id === injuryId);
  if (!injury) return t('injury');
  return [t(`injury-type-${injury.type ?? 'unknown'}`), injury.location ? t(injury.location) : null]
    .filter(Boolean)
    .join(' · ');
};

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
  const value = (key: string) => alert.modifiers?.find((m) => m.key === key)?.value;

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
    // Workspace spec 068: a treated wound bleeds again, and a tourniquet left too long
    case 'wound-reopened':
      return (
        <Stack spacing={1}>
          <Alert severity="error">
            {t('alert-wound-reopened-text', {
              injury: injuryName(actorRound, modifier('injuryId'), t),
              reason: t(`wound-reopened-reason-${modifier('reason') ?? 'exertion'}`),
              bleeding: value('bleeding') ?? 0,
            })}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            {t('alert-wound-reopened-help')}
          </Typography>
        </Stack>
      );
    case 'limb-loss':
      return (
        <Stack spacing={1}>
          <Alert severity="error">
            {t('alert-limb-loss-text', {
              injury: injuryName(actorRound, modifier('injuryId'), t),
              rounds: value('rounds') ?? 0,
            })}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            {t('alert-limb-loss-help')}
          </Typography>
        </Stack>
      );
    case 'tourniquet-loosen':
      return (
        <Stack spacing={1}>
          <Typography>
            {t('alert-tourniquet-loosen-text', {
              injury: injuryName(actorRound, modifier('injuryId'), t),
              rounds: value('rounds') ?? 0,
            })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('alert-tourniquet-loosen-help')}
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
