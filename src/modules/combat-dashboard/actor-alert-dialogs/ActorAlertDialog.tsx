import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import { RmuDialog } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActorRound, ActorRoundAlert } from '../../api/actor-rounds.dto';
import ActorAlertForm from './ActorAlertForm';

const ActorAlertDialog: FC<{
  actorRound: ActorRound;
  alertId: string;
  open: boolean;
  onClose: () => void;
  onSave?: (updated: ActorRoundAlert) => void;
}> = ({ actorRound, alertId, open, onClose, onSave }) => {
  const { t } = useTranslation();

  const [currentAlert, setCurrentAlert] = useState<ActorRoundAlert | undefined>(
    actorRound.alerts?.find((a) => a.id === alertId)
  );

  useEffect(() => {
    setCurrentAlert(actorRound.alerts?.find((a) => a.id === alertId));
  }, [actorRound, alertId]);

  const handleChange = (updated: ActorRoundAlert) => {
    setCurrentAlert(updated);
  };

  const handleSave = () => {
    if (currentAlert) onSave?.(currentAlert);
    onClose();
  };

  return (
    <RmuDialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      title={t('alert')}
      buttons={[
        <Button onClick={onClose}>{t('cancel')}</Button>,
        <Button onClick={handleSave} variant="contained" color="primary">
          {t('apply')}
        </Button>,
      ]}
    >
      {currentAlert ? (
        <ActorAlertForm actorRound={actorRound} alertId={alertId} onChange={handleChange} />
      ) : (
        <div>Alert not found</div>
      )}
    </RmuDialog>
  );
};

export default ActorAlertDialog;
