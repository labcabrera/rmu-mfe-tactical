import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Stack, Typography } from '@mui/material';
import { NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../CombatContext';
import { addActorRoundFatigueAccumulator, addActorRoundHp } from '../api/actor-rounds';
import { ActorRound } from '../api/actor-rounds.dto';
import { isGameFinished } from '../services/game-service';
import { useTacticalNotify } from '../services/notify-service';
import GenericBar from '../shared/generic/GenericBar';

const barSize = 160;

const ActorRoundBars: FC<{
  actorRound: ActorRound;
}> = ({ actorRound }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const { game, updateActorRound } = useContext(CombatContext)!;
  // A finished game is read-only (spec 013).
  const readOnly = isGameFinished(game);
  const deathThreshold = actorRound.hp?.deathThreshold ?? actorRound.hp?.max ?? 0;

  const updateActorRoundHP = (newHp: number) => {
    const diff = (actorRound.hp?.current ?? 0) - newHp;
    addActorRoundHp(actorRound.id, diff, auth)
      .then((updated) => updateActorRound(updated))
      .catch((err) => notify.error(err));
  };

  const updateActorRoundFatigueAccumulator = (newFatigue: number) => {
    const diff = newFatigue - (actorRound.fatigue?.accumulator ?? 0);
    addActorRoundFatigueAccumulator(actorRound.id, diff, auth)
      .then((updated) => updateActorRound(updated))
      .catch((err) => notify.error(err));
  };

  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      <Stack direction="column" spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Stack direction="row" spacing={2}>
          <GenericBar current={actorRound.hp?.current ?? 0} max={actorRound.hp?.max ?? 0} width={barSize} />
          <NumericInput
            label={t('new-hit-points')}
            value={actorRound.hp?.current ?? null}
            integer
            // Below 0 the actor is down; it dies past its Body Development bonus (§9.8 Hits).
            min={-deathThreshold - 1}
            // The API caps the hit points at the maximum and wakes the actor up when they go over 0.
            max={actorRound.hp?.max}
            disabled={readOnly}
            onChange={(e) => e !== null && updateActorRoundHP(Math.min(e, actorRound.hp?.max ?? e))}
          />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {t('death-threshold', { value: -deathThreshold })}
        </Typography>
        <Stack direction="row" spacing={2}>
          <GenericBar current={Math.round(actorRound.fatigue?.accumulator ?? 0)} max={100} width={barSize} />
          <NumericInput
            label={t('new-fatigue-accumulator')}
            value={actorRound.fatigue?.accumulator ?? null}
            maxFractionDigits={2}
            min={0}
            max={1000}
            disabled={readOnly}
            onChange={(e) => e !== null && updateActorRoundFatigueAccumulator(e)}
          />
        </Stack>
      </Stack>
      <Typography variant="subtitle2">{t('initiative-value', { value: actorRound.initiative?.total ?? 0 })}</Typography>
    </Stack>
  );
};

export default ActorRoundBars;
