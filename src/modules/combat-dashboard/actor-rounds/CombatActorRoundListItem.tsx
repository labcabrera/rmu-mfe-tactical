import React, { FC, useContext, useEffect, useState } from 'react';
import { Grid, Paper } from '@mui/material';
import { CombatContext } from '../../../CombatContext';
import { Action } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';
import type { Character } from '../../api/characters';
import type { TacticalGame } from '../../api/tactical-games';
import CombatFreeActionButtons from '../CombatFreeActionButtons';
import ActorRoundEffects from './ActorRoundEffects';
import CombatActorRoundListItemCharacter from './CombatActorRoundListItemCharacter';
import CombatActorRoundPhaseOptions from './CombatActorRoundPhaseOptions';
import CombatCharacterRoundInitiative from './CombatCharacterRoundInitiative';

const CombatActorRoundListItem: FC<{
  actorRound: ActorRound;
}> = ({ actorRound }) => {
  const [character, setCharacter] = useState<Character | undefined>();
  const { characters, game, roundActions } = useContext(CombatContext)!;

  useEffect(() => {
    if (actorRound && characters) {
      setCharacter(characters.find((item: Character) => item.id === actorRound.actorId));
    }
  }, [actorRound, characters]);

  if (!actorRound || !character || !game) return <p>CombatActorRoundListItem: loading...</p>;

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
      <PhaseOptions actorRound={actorRound} character={character} game={game} roundActions={roundActions} phase={1} />
      <PhaseOptions actorRound={actorRound} character={character} game={game} roundActions={roundActions} phase={2} />
      <PhaseOptions actorRound={actorRound} character={character} game={game} roundActions={roundActions} phase={3} />
      <PhaseOptions actorRound={actorRound} character={character} game={game} roundActions={roundActions} phase={4} />
      <Grid size={1}></Grid>
      <Grid size={3}>
        <ActorRoundEffects actorRound={actorRound} />
      </Grid>
    </Grid>
  );
};

const PhaseOptions: FC<{
  actorRound: ActorRound;
  character: Character;
  game: TacticalGame;
  roundActions: Action[];
  phase: number;
}> = ({ actorRound, character, game, roundActions, phase }) => {
  if (!roundActions || !game) return <p>Loading...</p>;

  const gamePhaseAsInt = game.phase.startsWith('phase_') ? parseInt(game.phase.replace('phase_', '')) : 5;

  const getActiveActionByPhase = (phase: number) => {
    return roundActions
      .filter(() => phase <= gamePhaseAsInt)
      .filter((action) => action.actorId === actorRound.actorId)
      .filter((action) => phase >= action.phaseStart)
      .find((action) => !action.phaseEnd || action.phaseEnd >= phase);
  };

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
        <CombatActorRoundPhaseOptions
          game={game}
          actorRound={actorRound}
          character={character}
          phase={phase}
          activeAction={getActiveActionByPhase(phase)}
        />
      </Paper>
    </Grid>
  );
};

export default CombatActorRoundListItem;
