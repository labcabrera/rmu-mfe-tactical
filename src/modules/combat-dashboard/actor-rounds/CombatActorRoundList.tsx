import React, { useContext } from 'react';
import Grid from '@mui/material/Grid';
import { CombatContext } from '../../../CombatContext';
import type { ActorRound } from '../../api/actor-rounds';
import CombatActorRoundListItem from './CombatActorRoundListItem';

const CombatActorRoundList: React.FC = () => {
  const { actorRounds } = useContext(CombatContext)!;

  if (!actorRounds || actorRounds.length === 0) {
    return <p>CombatActorRoundList: loading...</p>;
  }

  return (
    <>
      <Grid container spacing={2} columns={12} sx={{ mt: 1, mb: 1 }}>
        <Grid size={2}>Actors</Grid>
        <Grid size={1}>Initiative</Grid>
        <Grid size={1}>Free actions</Grid>
        <Grid size={1}>Phase 1</Grid>
        <Grid size={1}>Phase 2</Grid>
        <Grid size={1}>Phase 3</Grid>
        <Grid size={1}>Phase 4</Grid>
        <Grid size={3}></Grid>
        <Grid size={1}></Grid>
      </Grid>
      {actorRounds.map((item: ActorRound, index: number) => (
        <CombatActorRoundListItem key={index} actorRound={item} />
      ))}
    </>
  );
};

export default CombatActorRoundList;
