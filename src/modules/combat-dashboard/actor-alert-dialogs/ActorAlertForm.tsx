import React, { FC, useEffect, useState } from 'react';
import { ActorRound, ActorRoundAlert } from '../../api/actor-rounds.dto';

type ActorAlertFormProps = {
  actorRound: ActorRound;
  alertId: string;
  onChange?: (updated: ActorRoundAlert) => void;
};

const EnduranceForm: FC<{ alert: ActorRoundAlert; onChange?: (a: ActorRoundAlert) => void }> = ({
  alert,
  onChange,
}) => {
  // Basic structure: treat alert.value as a numeric string for endurance amount
  const [amount, setAmount] = useState<string>(alert.value || '');

  useEffect(() => {
    setAmount(alert.value || '');
  }, [alert]);

  const handleChange = (v: string) => {
    setAmount(v);
    onChange?.({ ...alert, value: v });
  };

  return (
    <div>
      <label>Endurance amount</label>
      <input type="number" value={amount} onChange={(e) => handleChange(e.target.value)} style={{ width: '100%' }} />
    </div>
  );
};

const BreakageForm: FC<{ alert: ActorRoundAlert; onChange?: (a: ActorRoundAlert) => void }> = ({ alert, onChange }) => {
  // Basic structure: treat alert.value as free text describing the breakage
  const [note, setNote] = useState<string>(alert.value || '');

  useEffect(() => {
    setNote(alert.value || '');
  }, [alert]);

  const handleChange = (v: string) => {
    setNote(v);
    onChange?.({ ...alert, value: v });
  };

  return (
    <div>
      <label>Breakage details</label>
      <textarea value={note} onChange={(e) => handleChange(e.target.value)} style={{ width: '100%' }} />
    </div>
  );
};

const ActorAlertForm: FC<ActorAlertFormProps> = ({ actorRound, alertId, onChange }) => {
  const alert = actorRound.alerts?.find((a) => a.id === alertId);

  if (!alert) return <div>Alert not found</div>;

  switch (alert.type) {
    case 'endurance':
      return <EnduranceForm alert={alert} onChange={onChange} />;
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
