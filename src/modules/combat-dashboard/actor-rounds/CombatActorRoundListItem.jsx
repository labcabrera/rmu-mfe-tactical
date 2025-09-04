/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { CombatContext } from '../../../CombatContext';
import CombatFreeActionButtons from '../CombatFreeActionButtons';
import CombatActorRoundListItemCharacter from './CombatActorRoundListItemCharacter';
import CombatActorRoundPhaseOptions from './CombatActorRoundPhaseOptions';
import CombatCharacterRoundInitiative from './CombatCharacterRoundInitiative';

const PhaseOptions = ({ actorRound, character, game, phase }) => {
  return (
    <Grid item size={1}>
      <Paper
        elevation={game.phase === `phase_${phase}` ? 2 : 0}
        style={{
          height: '100%',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CombatActorRoundPhaseOptions actorRound={actorRound} character={character} phase={phase} />
      </Paper>
    </Grid>
  );
};

const CombatActorRoundListItem = ({ actorRound }) => {
  const [character, setCharacter] = useState();
  const { characters } = useContext(CombatContext);
  const { game } = useContext(CombatContext);

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
      <Grid item size={1}>
        <Paper
          elevation={game.phase === 'initiative' ? 0 : 2}
          style={{
            height: '100%',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CombatCharacterRoundInitiative actorRound={actorRound} />
        </Paper>
      </Grid>
      <Grid item size={1}>
        <Paper elevation={game.phase.startsWith('phase_') ? 2 : 0} style={{ height: '100%', padding: '16px' }}>
          <CombatFreeActionButtons />
        </Paper>
      </Grid>
      <PhaseOptions actorRound={actorRound} character={character} game={game} phase={1} />
      <PhaseOptions actorRound={actorRound} character={character} game={game} phase={2} />
      <PhaseOptions actorRound={actorRound} character={character} game={game} phase={3} />
      <PhaseOptions actorRound={actorRound} character={character} game={game} phase={4} />
      <Grid item size={3}></Grid>
      <Grid item size={1}></Grid>
    </Grid>
  );
};

export default CombatActorRoundListItem;
