import React, { FC, useEffect, useState } from 'react';
import { ActorRoundAlert } from '../../api/actor-rounds.dto';

type Props = {
  alert: ActorRoundAlert;
  onChange?: (a: ActorRoundAlert) => void;
};

const BreakageForm: FC<Props> = ({ alert, onChange }) => {
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

export default BreakageForm;
