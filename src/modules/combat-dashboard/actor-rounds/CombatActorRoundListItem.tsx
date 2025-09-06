import React, { FC, useContext, useEffect, useState } from 'react';
import { Grid, Paper } from '@mui/material';
import { CombatContext } from '../../../CombatContext';
import type { ActorRound } from '../../api/actor-rounds';
import type { Character } from '../../api/characters';
import type { TacticalGame } from '../../api/tactical-games';
import CombatFreeActionButtons from '../CombatFreeActionButtons';
import ActorRoundEffects from './ActorRoundEffects';
import CombatActorRoundListItemCharacter from './CombatActorRoundListItemCharacter';
import CombatActorRoundPhaseOptions from './CombatActorRoundPhaseOptions';
import CombatCharacterRoundInitiative from './CombatCharacterRoundInitiative';

type PhaseOptionsProps = {
  actorRound: ActorRound;
  character: Character;
  game: TacticalGame;
  phase: number;
};

const PhaseOptions: FC<PhaseOptionsProps> = ({ actorRound, character, game, phase }) => {
  return (
    <Grid size={1}>
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

type CombatActorRoundListItemProps = {
  actorRound: ActorRound;
};

const CombatActorRoundListItem: FC<CombatActorRoundListItemProps> = ({ actorRound }) => {
  const [character, setCharacter] = useState<Character | undefined>();
  const { characters, game } = useContext(CombatContext)!;

  useEffect(() => {
    if (actorRound && characters) {
      setCharacter(characters.find((item: Character) => item.id === actorRound.actorId));
    }
  }, [actorRound, characters]);

  if (!actorRound || !character || !game) {
    return <p>CombatActorRoundListItem: loading...</p>;
  }

  return (
    <Grid container spacing={2} columns={12} sx={{ mt: 1, mb: 1 }}>
      <Grid size={2}>
        <CombatActorRoundListItemCharacter actorRound={actorRound} />
      </Grid>
      <Grid size={1}>
        <Paper
          elevation={game.phase === 'declare_initiative' ? 2 : 0}
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
      <Grid size={1}>
        <Paper elevation={game.phase.startsWith('phase_') ? 2 : 0} style={{ height: '100%', padding: '16px' }}>
          <CombatFreeActionButtons tacticalGame={game} character={character} />
        </Paper>
      </Grid>
      <PhaseOptions actorRound={actorRound} character={character} game={game} phase={1} />
      <PhaseOptions actorRound={actorRound} character={character} game={game} phase={2} />
      <PhaseOptions actorRound={actorRound} character={character} game={game} phase={3} />
      <PhaseOptions actorRound={actorRound} character={character} game={game} phase={4} />
      <Grid size={1}></Grid>
      <Grid size={3}>
        <ActorRoundEffects actorRound={actorRound} />
      </Grid>
    </Grid>
  );
};

export default CombatActorRoundListItem;
