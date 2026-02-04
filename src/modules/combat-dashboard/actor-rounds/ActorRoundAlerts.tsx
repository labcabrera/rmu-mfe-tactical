import React, { FC, useContext, useState } from 'react';
import { Button } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../CombatContext';
import { ActorRound, ActorRoundAlert } from '../../api/actor-rounds.dto';
import ActorAlertDialog from '../actor-alert-dialogs/ActorAlertDialog';

const ActorRoundAlerts: FC<{
  actorRound: ActorRound;
}> = ({ actorRound }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const combat = useContext(CombatContext);

  if (!actorRound) return <p>Loading...</p>;

  const handleAlertClick = (alertId: string) => {
    setSelectedAlertId(alertId);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedAlertId(null);
  };

  const handleSave = (updated: ActorRoundAlert) => {
    // create updated actorRound with replaced alert
    const updatedAlerts = (actorRound.alerts || []).map((a) => (a.id === updated.id ? updated : a));
    const updatedActorRound: ActorRound = { ...actorRound, alerts: updatedAlerts };
    combat?.updateActorRound(updatedActorRound);
  };

  return (
    <>
      {actorRound.alerts && actorRound.alerts.length > 0 && (
        <>
          {actorRound.alerts.map((alert) => (
            <Button
              key={alert.id}
              variant="contained"
              color="error"
              size="small"
              onClick={() => handleAlertClick(alert.id)}
              sx={{ mr: 0.5, mb: 0.5 }}
            >
              {t(`alert-${alert.type}`)}
            </Button>
          ))}
        </>
      )}

      {selectedAlertId && (
        <ActorAlertDialog
          actorRound={actorRound}
          alertId={selectedAlertId}
          open={dialogOpen}
          onClose={handleClose}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default ActorRoundAlerts;
