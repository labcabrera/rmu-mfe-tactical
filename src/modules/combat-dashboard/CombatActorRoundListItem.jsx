/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from 'react';
import { Box } from '@mui/material';
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
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={0} columns={24} alignItems="center">
        <Grid item size={5}>
          <CombatActorRoundListItemCharacter actorRound={actorRound} />
        </Grid>
        <Grid item size={19}>
          <Grid container item alignItems="center">
            <Grid item size={2} display="flex" justifyContent="center">
              <CombatCharacterRoundInitiative />
            </Grid>
            <Grid item size={2} display="flex" justifyContent="center">
              <CombatFreeActionButtons />
            </Grid>
            <Grid item size={2} display="flex" justifyContent="center">
              <CombatActorRoundPhaseOptions actorRound={actorRound} actor={actorRound} phase={1} />
            </Grid>
            <Grid item size={2} display="flex" justifyContent="center">
              <CombatActorRoundPhaseOptions actorRound={actorRound} actor={actorRound} phase={2} />
            </Grid>
            <Grid item size={2} display="flex" justifyContent="center">
              <CombatActorRoundPhaseOptions actorRound={actorRound} actor={actorRound} phase={3} />
            </Grid>
            <Grid item size={2} display="flex" justifyContent="center">
              <CombatActorRoundPhaseOptions actorRound={actorRound} actor={actorRound} phase={4} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CombatActorRoundListItem;
