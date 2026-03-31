import React, { FC } from 'react';
import { ActorRound, ActorRoundAlert } from '../../api/actor-rounds.dto';
import BreakageForm from './BreakageForm';
import EnduranceForm from './EnduranceForm';

const ActorAlertForm: FC<{
  actorRound: ActorRound;
  alertId: string;
  onChange?: (updated: ActorRoundAlert) => void;
}> = ({ actorRound, alertId, onChange }) => {
  const alert = actorRound.alerts?.find((a) => a.id === alertId);

  if (!alert) return <div>Alert not found</div>;

  switch (alert.type) {
    case 'endurance':
      return <EnduranceForm actorRound={actorRound} alert={alert} />;
    case 'breakage':
      return <BreakageForm alert={alert} onChange={onChange} />;
    default:
      return (
        <div>
          <p>Tipo de alerta no soportado: {alert.type}</p>
        </div>
      );
  }
};

export default ActorAlertForm;
