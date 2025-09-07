import React, { useContext, useEffect, useState } from 'react';
import { CombatContext } from '../../../CombatContext';
import type { Action } from '../../api/actions';
import type { ActorRound } from '../../api/actor-rounds';
import type { Character } from '../../api/characters';
import ResolveActionCard from '../ResolveActionCard';
import PhaseActionButton from './PhaseActionButton';
import ViewPrevAction from './ViewPrevAction';

type CombatActorRoundPhaseOptionsProps = {
  actorRound: ActorRound;
  character: Character;
  phase: number;
};

const CombatActorRoundPhaseOptions: React.FC<CombatActorRoundPhaseOptionsProps> = ({ actorRound, character, phase }) => {
  const [activeAction, setActiveAction] = useState<Action | null>(null);
  const { game, roundActions } = useContext(CombatContext)!;

  const loadActiveAction = () => {
    try {
      if (!roundActions || roundActions.length < 1) {
        setActiveAction(null);
        return;
      }
      const actorActions = roundActions.filter((e: Action) => e.actorId === actorRound.actorId && e.phaseStart <= phase);
      for (const action of actorActions) {
        setActiveAction(action);
        return;
      }
    } catch (error) {
      console.error('Error in loadActiveAction: ', error);
      setActiveAction(null);
    }
    setActiveAction(null);
  };

  useEffect(() => {
    loadActiveAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadActiveAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundActions]);

  if (!actorRound || !phase || !roundActions) {
    return <p>Loading character phase...</p>;
  }

  if (!activeAction) {
    return <p>No active action</p>;
  }

  if (!activeAction && game && game.phase && game.phase === `phase_${phase}`) {
    return <PhaseActionButton actorRound={actorRound} phaseNumber={phase} />;
  }

  if (activeAction && game.phase === `phase_${phase}`) {
    return <ResolveActionCard action={activeAction} character={character} actorRound={actorRound} />;
  }

  return <ViewPrevAction activeAction={activeAction} actorRound={actorRound} character={character} phase={phase} />;
};

export default CombatActorRoundPhaseOptions;
