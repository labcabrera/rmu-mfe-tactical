/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import CombatActorRoundListItemCharacter from './CombatActorRoundListItemCharacter';
import CombatActorRoundPhaseOptions from './CombatActorRoundPhaseOptions';
import CombatCharacterRoundInitiative from './CombatCharacterRoundInitiative';
import CombatFreeActionButtons from './CombatFreeActionButtons';
import { CombatContext } from './CombatProvider';

const CombatActorRoundListItem = ({ actorRound }) => {
  const [character, setCharacter] = useState();
  const { characters } = useContext(CombatContext);

  const loadCharacter = (actorRound, characters) => {
    setCharacter(characters.find((item) => item.id === actorRound.actorId));
  };

  useEffect(() => {
    if (actorRound && characters) {
      loadCharacter(actorRound, characters);
    }
  }, [actorRound, characters]);

  if (!actorRound || !character) {
    return <p>CombatActorRoundListItem: loading...</p>;
  }

  return (
    <Grid container spacing={2} columns={12} sx={{ mt: 1, mb: 1 }}>
      <Grid item size={2}>
        <CombatActorRoundListItemCharacter actorRound={actorRound} />
      </Grid>
      <Grid item size={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CombatCharacterRoundInitiative />
      </Grid>
      <Grid item size={1}>
        <CombatFreeActionButtons />
      </Grid>
      <Grid item size={1}>
        <CombatActorRoundPhaseOptions actorRound={actorRound} actor={actorRound} phase={1} />
      </Grid>
      <Grid item size={1}>
        <CombatActorRoundPhaseOptions actorRound={actorRound} actor={actorRound} phase={2} />
      </Grid>
      <Grid item size={1}>
        <CombatActorRoundPhaseOptions actorRound={actorRound} actor={actorRound} phase={3} />
      </Grid>
      <Grid item size={1}>
        <CombatActorRoundPhaseOptions actorRound={actorRound} actor={actorRound} phase={4} />
      </Grid>
      <Grid item size={3}></Grid>
      <Grid item size={1}></Grid>
    </Grid>
  );
};

export default CombatActorRoundListItem;
