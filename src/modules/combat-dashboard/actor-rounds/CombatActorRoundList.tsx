import React, { FC, useContext } from 'react';
import NextPlanIcon from '@mui/icons-material/NextPlan';
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
      <Grid container spacing={2} columns={12} sx={{ mt: 1, mb: 1 }}>
        <Grid size={3}></Grid>
        <Grid size={1}>
          <Typography variant="h6" align="left" color={game.phase === 'declare_initiative' ? 'success' : 'secondary'}>
            Initiative
            {game.phase === 'declare_initiative' && (
              <IconButton size="small" color="success" onClick={() => onRandomizeInitiatives()}>
                <NextPlanIcon fontSize="small" />
              </IconButton>
            )}
          </Typography>
        </Grid>
        <Grid size={5}>
          {/* <Paper elevation={0} square sx={headerPaperSx}> */}
          <Grid container spacing={0}>
            <Grid size={3}>
              <Typography variant="h6" align="left" color={game.phase === 'phase_1' ? 'success' : 'secondary'}>
                Phase 1
              </Typography>
            </Grid>
            <Grid size={3}>
              <Typography variant="h6" align="left" color={game.phase === 'phase_2' ? 'success' : 'secondary'}>
                Phase 2
              </Typography>
            </Grid>
            <Grid size={3}>
              <Typography variant="h6" align="left" color={game.phase === 'phase_3' ? 'success' : 'secondary'}>
                Phase 3
              </Typography>
            </Grid>
            <Grid size={3}>
              <Typography variant="h6" align="left" color={game.phase === 'phase_4' ? 'success' : 'secondary'}>
                Phase 4
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid size={2}>
          <Typography variant="h6" align="left" color="primary">
            Effects
          </Typography>
        </Grid>
        <Grid size={1}>
          <Typography variant="h6" align="left" color="primary">
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
