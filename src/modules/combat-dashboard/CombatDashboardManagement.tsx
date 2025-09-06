import React, { FC, useContext, useState } from 'react';
import { Button, Grid } from '@mui/material';
import { CombatContext } from '../../CombatContext';
import { useError } from '../../ErrorContext';
import { addActorRoundHp } from '../api/actor-rounds';
import NumericTextField from '../shared/inputs/NumericTextField';
import SelectActorRound from '../shared/selects/SelectActorRound';

const CombatDashboardManagement: FC = () => {
  const { showError } = useError();
  const { actorRounds, updateActorRound } = useContext(CombatContext);
  const [hpActorId, setHpActorId] = useState<string | null>(null);
  const [hpValue, setHpValue] = useState<string | null>(null);

  const handleAddHp = () => {
    addActorRoundHp(hpActorId!, parseInt(hpValue!))
      .then((data) => {
        updateActorRound(data);
      })
      .catch((err) => {
        showError(err.message);
      });
  };

  if (!actorRounds) return <p>Loading...</p>;

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={1}>
          <SelectActorRound value={hpActorId} actorRounds={actorRounds} onChange={(e) => setHpActorId(e.target.value)} />
        </Grid>
        <Grid size={1}>
          <NumericTextField label="Test Input" value={hpValue} onChange={(e) => setHpValue(e.target.value)} />
        </Grid>
        <Grid size={1}>
          <Button variant="contained" disabled={!hpActorId || !hpValue} onClick={handleAddHp}>
            Add HP
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default CombatDashboardManagement;
