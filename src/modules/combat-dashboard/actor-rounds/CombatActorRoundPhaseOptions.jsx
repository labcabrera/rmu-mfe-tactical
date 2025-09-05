/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { CombatContext } from '../../../CombatContext';
import ResolveActionCard from '../ResolveActionCard';
import CombatActorRoundPhaseActionButtons from './CombatActorRoundPhaseActionButtons';

const CombatActorRoundPhaseOptions = ({ actorRound, character, phase }) => {
  const [activeAction, setActiveAction] = useState(null);
  const { game } = useContext(CombatContext);
  const { roundActions } = useContext(CombatContext);

  const loadActiveAction = () => {
    try {
      if (!roundActions || roundActions.length < 1) {
        setActiveAction(null);
      }
      const actorActions = roundActions.filter((e) => e.actorId == actorRound.actorId && e.phaseStart <= phase);
      for (let action of actorActions) {
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
  }, []);

  useEffect(() => {
    loadActiveAction();
  }, [roundActions]);

  if (!actorRound || !phase || !roundActions) {
    return <p>Loading character phase...</p>;
  }

  if (activeAction == null && game && game.phase && game.phase === `phase_${phase}`) {
    return <CombatActorRoundPhaseActionButtons actorRound={actorRound} game={game} character={character} phaseNumber={phase} />;
  }

  if (activeAction && game.phase === `phase_${phase}`) {
    return <ResolveActionCard action={activeAction} character={character} actorRound={actorRound} />;
  }

  if (!activeAction) {
    return <p>No active action</p>;
  }

  return (
    <Stack direction="row">
      <IconButton
        disabled
        style={{
          width: `70px`,
          height: `70px`,
          opacity: 0.5,
        }}
      >
        <img
          src={`/static/images/actions/${activeAction.actionType}.png`}
          alt={activeAction.actionType}
          style={{ width: '100%', height: '100%', borderRadius: '50%' }}
        />
      </IconButton>
    </Stack>
  );
};

export default CombatActorRoundPhaseOptions;
