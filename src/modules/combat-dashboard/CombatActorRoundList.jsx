import React, { useContext } from 'react';
import Grid from '@mui/material/Grid';
import CombatActorRoundListItem from './CombatActorRoundListItem';
import { CombatContext } from './CombatProvider';

const CombatActorRoundList = () => {
  const { actorRounds } = useContext(CombatContext);

  if (!actorRounds || actorRounds.length === 0) {
    return <p>CombatActorRoundList: loading...</p>;
  }

  return (
    <>
      <Grid container spacing={2} columns={12} sx={{ mt: 1, mb: 1 }}>
        <Grid item size={2}>
          Actors
        </Grid>
        <Grid item size={1}>
          Initiative
        </Grid>
        <Grid item size={1}>
          Free actions
        </Grid>
        <Grid item size={1}>
          Phase 1
        </Grid>
        <Grid item size={1}>
          Phase 2
        </Grid>
        <Grid item size={1}>
          Phase 3
        </Grid>
        <Grid item size={1}>
          Phase 4
        </Grid>
        <Grid item size={3}></Grid>
        <Grid item size={1}></Grid>
      </Grid>
      {actorRounds.map((item, index) => (
        <CombatActorRoundListItem key={index} actorRound={item} />
      ))}
    </>
  );
};

export default CombatActorRoundList;
