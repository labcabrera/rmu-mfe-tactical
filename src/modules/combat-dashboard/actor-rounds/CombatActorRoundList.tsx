import React, { useContext } from 'react';
import NextPlanIcon from '@mui/icons-material/NextPlan';
import { IconButton } from '@mui/material';
import Grid from '@mui/material/Grid';
import { CombatContext } from '../../../CombatContext';
import { useError } from '../../../ErrorContext';
import { ActorRound } from '../../api/actor-rounds.dto';
import { randomizeInitiatives } from '../../api/tactical-games';
import CombatActorRoundListItem from './CombatActorRoundListItem';

const CombatActorRoundList: React.FC = () => {
  const { game, actorRounds, refreshActorRounds } = useContext(CombatContext)!;
  const { showError } = useError();

  if (!actorRounds || actorRounds.length === 0) {
    return <p>Loading...</p>;
  }

  const onRandomizeInitiatives = () => {
    randomizeInitiatives(game.id)
      .then(() => refreshActorRounds())
      .catch((error: unknown) => {
        if (error instanceof Error) showError(error.message);
        else showError('Unknown error occurred');
      });
  };

  return (
    <>
      <Grid container spacing={2} columns={12} sx={{ mt: 1, mb: 1 }}>
        <Grid size={2}>Actors</Grid>
        <Grid size={1}>
          <span>Initiative</span>
          <IconButton size="small" onClick={() => onRandomizeInitiatives()}>
            <NextPlanIcon fontSize="small" />
          </IconButton>
        </Grid>
        <Grid size={1}>Free actions</Grid>
        <Grid size={1}>Phase 1</Grid>
        <Grid size={1}>Phase 2</Grid>
        <Grid size={1}>Phase 3</Grid>
        <Grid size={1}>Phase 4</Grid>
        <Grid size={1}>Alerts</Grid>
        <Grid size={3}>Effects</Grid>
      </Grid>
      {actorRounds.map((item: ActorRound, index: number) => (
        <CombatActorRoundListItem key={index} actorRound={item} />
      ))}
    </>
  );
};

export default CombatActorRoundList;
