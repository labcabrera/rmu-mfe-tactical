import React, { FC, useContext, useState } from 'react';
import { Button, Grid } from '@mui/material';
import { CombatContext } from '../../CombatContext';
import { useError } from '../../ErrorContext';
import { addActorRoundHp, addActorRoundEffect } from '../api/actor-rounds';
import { ActorRoundEffect } from '../api/actor-rounds.dto';
import { NumericInput } from '../shared/inputs/NumericInput';
import SelectActorRound from '../shared/selects/SelectActorRound';
import SelectEffect from '../shared/selects/SelectEffect';

const CombatDashboardManagement: FC = () => {
  const { showError } = useError();
  const { actorRounds, updateActorRound } = useContext(CombatContext);
  const [actorId, setActorId] = useState<string | null>(null);
  const [hpValue, setHpValue] = useState<number | null>(null);
  const [effectFormData, setEffectFormData] = useState<ActorRoundEffect | null>(null);

  const handleAddHp = () => {
    addActorRoundHp(actorId!, hpValue!)
      .then((data) => updateActorRound(data))
      .catch((err) => showError(err.message));
  };

  const handleAddEffect = () => {
    addActorRoundEffect(actorId!, effectFormData)
      .then((data) => updateActorRound(data))
      .catch((err) => showError(err.message));
  };

  if (!actorRounds) return <p>Loading...</p>;

  return (
    <Grid container spacing={2}>
      <Grid size={1}>
        <SelectActorRound value={actorId} actorRounds={actorRounds} onChange={(e) => setActorId(e.id)} />
      </Grid>
      <Grid size={1}>
        <Button variant="contained" disabled={!actorId || !hpValue} onClick={handleAddHp}>
          Add HP
        </Button>
      </Grid>
      <Grid size={1}>
        <NumericInput label="HP" value={hpValue} onChange={(e) => setHpValue(e)} />
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={1}></Grid>
      <Grid size={1}>
        <Button variant="contained" disabled={!actorId} onClick={handleAddEffect}>
          Add Effect
        </Button>
      </Grid>
      <Grid size={1}>
        <SelectEffect
          value={effectFormData?.status || ''}
          onChange={(e) => setEffectFormData({ ...effectFormData, status: e.target.value })}
        />
      </Grid>
    </Grid>
  );
};

export default CombatDashboardManagement;
