import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Box, Chip, Stack, Tooltip, Typography } from '@mui/material';
import {
  ChipRow,
  FATIGUE_CRITICAL_PENALTY_SOURCE,
  FATIGUE_REST_ROUNDS,
  NumberPadField,
  ResourceBar,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../CombatContext';
import { addActorRoundFatigueAccumulator, addActorRoundHp } from '../api/actor-rounds';
import { ActorRound } from '../api/actor-rounds.dto';
import LowerInitiativeButton from '../combat-dashboard/actor-rounds/initiative/LowerInitiativeButton';
import { isGameFinished } from '../services/game-service';
import { useTacticalNotify } from '../services/notify-service';

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
  // Workspace spec 077: the fatigue penalty (0-50 points), the one of the criticals (outside the cap) and the rest
  const fatiguePoints = actorRound.fatigue?.fatigue ?? 0;
  const criticalFatigue = (actorRound.penalty?.modifiers ?? [])
    .filter((modifier) => modifier.source === FATIGUE_CRITICAL_PENALTY_SOURCE)
    .reduce((sum, modifier) => sum + modifier.value, 0);
  const restRounds = actorRound.fatigue?.restRounds ?? 0;

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
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Box sx={{ width: barSize }}>
            <ResourceBar
              label={t('hit-points')}
              kind="hp"
              current={actorRound.hp?.current ?? 0}
              max={actorRound.hp?.max ?? 0}
            />
          </Box>
          <NumberPadField
            label={t('new-hit-points')}
            value={actorRound.hp?.current ?? null}
            integer
            // Below 0 the actor is down; it dies past its Body Development bonus (§9.8 Hits).
            min={-deathThreshold - 1}
            // The API caps the hit points at the maximum and wakes the actor up when they go over 0.
            max={actorRound.hp?.max}
            steps={[-10, -1, 1, 10]}
            disabled={readOnly}
            onChange={(e) => e !== null && updateActorRoundHP(Math.min(e, actorRound.hp?.max ?? e))}
          />
        </Stack>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Box sx={{ width: barSize }}>
            <ResourceBar
              label={t('fatigue')}
              kind="fatigue"
              current={Math.round(actorRound.fatigue?.accumulator ?? 0)}
              max={100}
            />
          </Box>
          <NumberPadField
            label={t('new-fatigue-accumulator')}
            value={actorRound.fatigue?.accumulator ?? null}
            steps={[-10, -5, 5, 10]}
            min={0}
            max={1000}
            disabled={readOnly}
            onChange={(e) => e !== null && updateActorRoundFatigueAccumulator(e)}
          />
        </Stack>
        <ChipRow>
          <Tooltip title={t('fatigue-penalty-help')}>
            <Chip
              size="small"
              variant="outlined"
              color={fatiguePoints > 0 ? 'warning' : 'default'}
              label={t('fatigue-penalty-value', { value: -fatiguePoints })}
            />
          </Tooltip>
          {criticalFatigue !== 0 && (
            <Tooltip title={t('fatigue-critical-help')}>
              <Chip
                size="small"
                variant="outlined"
                color="error"
                label={t('fatigue-critical-value', { value: criticalFatigue })}
              />
            </Tooltip>
          )}
          <Tooltip title={t('fatigue-rest-rounds-help', { rounds: FATIGUE_REST_ROUNDS })}>
            <Chip
              size="small"
              variant="outlined"
              color={actorRound.fatigue?.exerted ? 'default' : 'success'}
              label={
                actorRound.fatigue?.exerted
                  ? t('fatigue-exerted')
                  : t('fatigue-rest-rounds', { count: restRounds, rounds: FATIGUE_REST_ROUNDS })
              }
            />
          </Tooltip>
        </ChipRow>
      </Stack>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
        <Typography variant="subtitle2">
          {t('initiative-value', { value: actorRound.initiative?.total ?? 0 })}
        </Typography>
        <LowerInitiativeButton actorRound={actorRound} />
      </Stack>
    </Stack>
  );
};

export default ActorRoundBars;
