import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ActorRound, ActorRoundAlert } from '../../api/actor-rounds.dto';

/** Form of an alert resolved locally. Endurance and breakage alerts have their own dialogs in `ActorAlertDialog`. */
const ActorAlertForm: FC<{
  actorRound: ActorRound;
  alertId: string;
  onChange?: (updated: ActorRoundAlert) => void;
}> = ({ actorRound, alertId }) => {
  const { t } = useTranslation();
  const alert = actorRound.alerts?.find((a) => a.id === alertId);

  if (!alert) return <div>{t('alert-not-found')}</div>;

  switch (alert.type) {
    default:
      return (
        <div>
          <p>{t('unsupported-alert-type', { type: alert.type })}</p>
        </div>
      );
  }
};

export default ActorAlertForm;
