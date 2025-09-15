import React from 'react';
import type { Action } from '../../api/action';
import type { ActorRound } from '../../api/actor-rounds';
import type { Character } from '../../api/characters';
import { TacticalGame } from '../../api/tactical-games';
import ResolveActionCard from '../ResolveActionCard';
import PhaseActionButton from './PhaseActionButton';
import ViewPrevAction from './ViewPrevAction';

const CombatActorRoundPhaseOptions: React.FC<{
  game: TacticalGame;
  actorRound: ActorRound;
  character: Character;
  phase: number;
  activeAction: Action | null;
}> = ({ game, actorRound, character, phase, activeAction }) => {
  const canResolve = (action: Action, phase: number) => {
    return game.phase === `phase_${phase}`;
  };

  const ignoreAction = (action: Action | null) => {
    if (!action) return false;
    if (game.status === 'upkeep') return false;
    const gamePhaseAsInt = parseInt(game.phase.replace('phase_', ''));
    const ignore = gamePhaseAsInt < phase;
    return ignore;
  };

  if (ignoreAction(activeAction)) {
    return null;
  }

  if (activeAction && activeAction.status === 'completed') {
    return <ViewPrevAction activeAction={activeAction} actorRound={actorRound} character={character} phase={phase} />;
  }

  if (activeAction && canResolve(activeAction, phase)) {
    return <ResolveActionCard action={activeAction} character={character} actorRound={actorRound} />;
  }

  if (activeAction) {
    return <ViewPrevAction activeAction={activeAction} actorRound={actorRound} character={character} phase={phase} />;
  }

  if (!activeAction && game.phase === `phase_${phase}`) {
    return (
      <>
        <PhaseActionButton actorRound={actorRound} phaseNumber={phase} />
      </>
    );
  }

  return null;
};

export default CombatActorRoundPhaseOptions;
