import React, { FC, useContext } from 'react';
import CasinoIcon from '@mui/icons-material/Casino';
import { IconButton, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { CombatContext } from '../../../CombatContext';
import { useError } from '../../../ErrorContext';
import { ActorRound } from '../../api/actor-rounds.dto';
import { randomizeInitiatives } from '../../api/tactical-games';
import CombatActorRoundListItem from './CombatActorRoundListItem';

const CombatActorRoundList: FC = () => {
  const { game, actorRounds, refreshActorRounds } = useContext(CombatContext)!;
  const { showError } = useError();

  if (!actorRounds || actorRounds.length === 0) {
    return <p>Loading...</p>;
  }

  const onRandomizeInitiatives = () => {
    randomizeInitiatives(game.id)
      .then(() => refreshActorRounds())
      .catch((err) => showError(err.message));
  };

  return (
    <>
      <Grid container spacing={1}>
        <Grid size={3}></Grid>
        <Grid size={1}>
          <Typography
            variant="caption"
            align="left"
            color={game.phase === 'declare_initiative' ? 'primary' : 'secondary'}
          >
            Initiative
            {game.phase === 'declare_initiative' && (
              <IconButton size="small" color="primary" onClick={() => onRandomizeInitiatives()}>
                <CasinoIcon fontSize="small" />
              </IconButton>
            )}
          </Typography>
        </Grid>
        <Grid size={5}>
          <Grid container spacing={0}>
            <Grid size={3}>
              <Typography variant="caption" align="left" color={game.phase === 'phase_1' ? 'primary' : 'secondary'}>
                Phase 1
              </Typography>
            </Grid>
            <Grid size={3}>
              <Typography variant="caption" align="left" color={game.phase === 'phase_2' ? 'primary' : 'secondary'}>
                Phase 2
              </Typography>
            </Grid>
            <Grid size={3}>
              <Typography variant="caption" align="left" color={game.phase === 'phase_3' ? 'primary' : 'secondary'}>
                Phase 3
              </Typography>
            </Grid>
            <Grid size={3}>
              <Typography variant="caption" align="left" color={game.phase === 'phase_4' ? 'primary' : 'secondary'}>
                Phase 4
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid size={2}>
          <Typography variant="caption" align="left" color="secondary">
            Effects
          </Typography>
        </Grid>
        <Grid size={1}>
          <Typography variant="caption" align="left" color="secondary">
            Alerts
          </Typography>
        </Grid>
      </Grid>
      {actorRounds.map((item: ActorRound, index: number) => (
        <CombatActorRoundListItem key={index} actorRound={item} />
      ))}
    </>
  );
};

export default CombatActorRoundList;
