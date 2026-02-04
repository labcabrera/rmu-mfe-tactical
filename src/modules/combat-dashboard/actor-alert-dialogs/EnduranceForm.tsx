import React, { FC, useEffect, useState } from 'react';
import { ActorRoundAlert } from '../../api/actor-rounds.dto';

type Props = {
  alert: ActorRoundAlert;
  onChange?: (a: ActorRoundAlert) => void;
};

const EnduranceForm: FC<Props> = ({ alert, onChange }) => {
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

export default EnduranceForm;
