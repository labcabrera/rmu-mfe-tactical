import React, { FC, useContext } from 'react';
import NextPlanIcon from '@mui/icons-material/NextPlan';
import { IconButton, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
import { CombatContext } from '../../../CombatContext';
import { useError } from '../../../ErrorContext';
import { ActorRound } from '../../api/actor-rounds.dto';
import { randomizeInitiatives } from '../../api/tactical-games';
import CombatActorRoundListItem from './CombatActorRoundListItem';

const CombatActorRoundList: FC = () => {
  const { game, actorRounds, refreshActorRounds } = useContext(CombatContext)!;
  const { showError } = useError();

  const headerPaperSx = {
    height: 40,
    display: 'flex',
    alignItems: 'center',
    padding: '2px 8px',
  } as const;

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
        <Grid size={3}>
          <Paper elevation={0} square sx={headerPaperSx}>
            Actors
          </Paper>
        </Grid>
        <Grid size={1}>
          <Paper elevation={0} square sx={headerPaperSx}>
            <span style={{ marginRight: 6 }}>Initiative</span>
            <IconButton size="small" color="primary" onClick={() => onRandomizeInitiatives()}>
              <NextPlanIcon fontSize="small" />
            </IconButton>
          </Paper>
        </Grid>
        <Grid size={1}>
          <Paper elevation={0} square sx={headerPaperSx}>
            Free actions
          </Paper>
        </Grid>
        <Grid size={1}>
          <Paper elevation={0} square sx={headerPaperSx}>
            Phase 1
          </Paper>
        </Grid>
        <Grid size={1}>
          <Paper elevation={0} square sx={headerPaperSx}>
            Phase 2
          </Paper>
        </Grid>
        <Grid size={1}>
          <Paper elevation={0} square sx={headerPaperSx}>
            Phase 3
          </Paper>
        </Grid>
        <Grid size={1}>
          <Paper elevation={0} square sx={headerPaperSx}>
            Phase 4
          </Paper>
        </Grid>
        <Grid size={1}>
          <Paper elevation={0} square sx={headerPaperSx}>
            Alerts
          </Paper>
        </Grid>
        <Grid size={2}>
          <Paper elevation={0} square sx={headerPaperSx}>
            Effects
          </Paper>
        </Grid>
      </Grid>
      {actorRounds.map((item: ActorRound, index: number) => (
        <CombatActorRoundListItem key={index} actorRound={item} />
      ))}
    </>
  );
};

export default CombatActorRoundList;
