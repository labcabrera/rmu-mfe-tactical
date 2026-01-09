import React, { FC } from 'react';
import { Stack, Typography } from '@mui/material';
import { useError } from '../../ErrorContext';
import { addActorRoundHp } from '../api/actor-rounds';
import { ActorRound } from '../api/actor-rounds.dto';
import GenericBar from '../shared/generic/GenericBar';
import { NumericInput } from '../shared/inputs/NumericInput';

const barSize = 160;

const ActorRoundBars: FC<{
  actorRound: ActorRound;
  setActorRound: React.Dispatch<React.SetStateAction<ActorRound>>;
}> = ({ actorRound, setActorRound }) => {
  const { showError } = useError();

  const updateActorRoundHP = (newHp: number) => {
    const diff = newHp - (actorRound.hp?.current ?? 0);
    console.log('Updating HP by diff:', diff);
    addActorRoundHp(actorRound.id, diff)
      .then((updated) => setActorRound(updated))
      .catch((err) => showError(err));
  };

  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      <Stack direction="column" spacing={2} alignItems="flex-start">
        <GenericBar current={actorRound.hp?.current ?? 0} max={actorRound.hp?.max ?? 0} title="HP" width={barSize} />
        {actorRound.power && actorRound.power.max > 0 && (
          <GenericBar current={actorRound.power.current} max={actorRound.power.max} title="PWR" width={barSize} />
        )}
        <GenericBar current={Math.round(actorRound.fatigue?.accumulator ?? 0)} max={100} title="FA" width={barSize} />
      </Stack>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
        <NumericInput
          label="New hit points"
          value={actorRound.hp?.current ?? null}
          integer
          min={0}
          max={actorRound.hp?.max}
          onChange={(e) => {
            updateActorRoundHP(e);
          }}
        />
      </Stack>

      <Typography variant="subtitle2">Initiative: {actorRound.initiative?.total ?? 0}</Typography>
    </Stack>
  );
};

export default ActorRoundBars;
