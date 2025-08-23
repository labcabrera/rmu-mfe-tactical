import React, { useContext, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import CombatCharacterPhaseOptions from './CombatCharacterPhaseOptions';
import CombatCharacterRoundInfo from './CombatCharacterRoundInfo';
import CombatCharacterRoundInitiative from './CombatCharacterRoundInitiative';
import CombatFreeActionButtons from './CombatFreeActionButtons';
import { CombatContext } from './CombatProvider';

const CombatActorRound = ({ actorRound }) => {
  //   const [character, setCharacter] = useState();
  const { game } = useContext(CombatContext);
  const { characters } = useContext(CombatContext);
  const { roundActions } = useContext(CombatContext);

  //   const loadCharacter = () => {
  //     setCharacter(characters.find((item) => item.id === actorRound.characterId));
  //   };

  //   useEffect(() => {
  //     loadCharacter();
  //   }, []);

  //   if (!actorRound || !roundActions) {
  //     return <p>Loading character round...</p>;
  //   }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={0} columns={24} alignItems="center">
        <Grid item size={5}>
          <CombatCharacterRoundInfo actorRound={actorRound} />
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
              <CombatCharacterPhaseOptions actorRound={actorRound} phase={1} />
            </Grid>
            <Grid item size={2} display="flex" justifyContent="center">
              <CombatCharacterPhaseOptions actorRound={actorRound} phase={2} />
            </Grid>
            <Grid item size={2} display="flex" justifyContent="center">
              <CombatCharacterPhaseOptions actorRound={actorRound} phase={3} />
            </Grid>
            <Grid item size={2} display="flex" justifyContent="center">
              <CombatCharacterPhaseOptions actorRound={actorRound} phase={4} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CombatActorRound;
