import React, { FC } from 'react';
import { Button } from '@mui/material';
import { t } from 'i18next';
import { ActorRound } from '../../api/actor-rounds.dto';

const ActorRoundAlerts: FC<{
  actorRound: ActorRound;
}> = ({ actorRound }) => {
  if (!actorRound) return <p>Loading...</p>;

  const handleAlertClick = (alertId: string) => {
    //TODO
    console.log(`Alert ${alertId} clicked`);
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
            >
              {t(`alert-${alert.type}`)}
            </Button>
          ))}
        </>
      )}
    </>
  );
};

export default ActorRoundAlerts;
