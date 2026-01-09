import React, { Dispatch, FC, SetStateAction } from 'react';
import { Stack, Typography } from '@mui/material';
import { useError } from '../../ErrorContext';
import { addActorRoundHp } from '../api/actor-rounds';
import { ActorRound } from '../api/actor-rounds.dto';
import GenericBar from '../shared/generic/GenericBar';
import { NumericInput } from '../shared/inputs/NumericInput';

const barSize = 160;

const ActorRoundBars: FC<{
  actorRound: ActorRound;
  setActorRound: Dispatch<SetStateAction<ActorRound>>;
}> = ({ actorRound, setActorRound }) => {
  const { showError } = useError();

  const updateActorRoundHP = (newHp: number) => {
    const diff = (actorRound.hp?.current ?? 0) - newHp;
    console.log('Updating actor round HP by diff:', diff);
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
      <Stack spacing={1} sx={{ width: '120px' }}>
        <NumericInput
          label="New hit points"
          value={actorRound.hp?.current ?? null}
          integer
          min={0}
          max={actorRound.hp?.max}
          onChange={(e) => updateActorRoundHP(e)}
        />
      </Stack>

      {/* <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}> */}
      {/* </Stack> */}

      <Typography variant="subtitle2">Initiative: {actorRound.initiative?.total ?? 0}</Typography>
    </Stack>
  );
};

export default ActorRoundBars;
