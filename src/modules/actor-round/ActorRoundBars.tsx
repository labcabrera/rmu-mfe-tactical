import React, { FC, useContext } from 'react';
import { Stack, Typography } from '@mui/material';
import { NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../CombatContext';
import { useError } from '../../ErrorContext';
import { addActorRoundFatigueAccumulator, addActorRoundHp } from '../api/actor-rounds';
import { ActorRound } from '../api/actor-rounds.dto';
import GenericBar from '../shared/generic/GenericBar';

const barSize = 160;

const ActorRoundBars: FC<{
  actorRound: ActorRound;
}> = ({ actorRound }) => {
  const { showError } = useError();
  const { updateActorRound } = useContext(CombatContext)!;

  const updateActorRoundHP = (newHp: number) => {
    const diff = (actorRound.hp?.current ?? 0) - newHp;
    addActorRoundHp(actorRound.id, diff)
      .then((updated) => updateActorRound(updated))
      .catch((err) => showError(err));
  };

  const updateActorRoundFatigueAccumulator = (newFatigue: number) => {
    const diff = newFatigue - (actorRound.fatigue?.accumulator ?? 0);
    addActorRoundFatigueAccumulator(actorRound.id, diff)
      .then((updated) => updateActorRound(updated))
      .catch((err) => showError(err));
  };

  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      <Stack direction="column" spacing={2} alignItems="flex-start">
        <Stack direction="row" spacing={2}>
          <GenericBar current={actorRound.hp?.current ?? 0} max={actorRound.hp?.max ?? 0} width={barSize} />
          <NumericInput
            label="New hit points"
            value={actorRound.hp?.current ?? null}
            integer
            min={0}
            max={actorRound.hp?.max}
            onChange={(e) => updateActorRoundHP(e)}
          />
        </Stack>
        <Stack direction="row" spacing={2}>
          <GenericBar current={Math.round(actorRound.fatigue?.accumulator ?? 0)} max={100} width={barSize} />
          <NumericInput
            label="New fatigue accumulator"
            value={actorRound.fatigue?.accumulator ?? null}
            maxFractionDigits={2}
            min={0}
            max={1000}
            onChange={(e) => updateActorRoundFatigueAccumulator(e)}
          />
        </Stack>
      </Stack>
      <Typography variant="subtitle2">Initiative: {actorRound.initiative?.total ?? 0}</Typography>
    </Stack>
  );
};

export default ActorRoundBars;
