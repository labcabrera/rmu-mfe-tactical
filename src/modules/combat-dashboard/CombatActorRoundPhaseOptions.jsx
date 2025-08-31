import React, { useContext, useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import CombatActorRoundPhaseActionButtons from './CombatActorRoundPhaseActionButtons';
import { CombatContext } from './CombatProvider';
import ResolveActionCard from './ResolveActionCard';

const CombatActorRoundPhaseOptions = ({ actorRound, character, phase }) => {
  const [activeAction, setActiveAction] = useState(null);
  const { game } = useContext(CombatContext);
  const { roundActions } = useContext(CombatContext);

  const loadActiveAction = () => {
    console.log(`CombatCharacterPhaseOptions.loadActiveAction triggered for phase ${phase}. Actions: ${JSON.stringify(roundActions)}`);
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
    console.log(`CombatCharacterPhaseOptions.useEffect triggered`);
    loadActiveAction();
  }, []);

  useEffect(() => {
    console.log(`CombatCharacterPhaseOptions.useEffect[roundActions] triggered roundActions.length: ` + roundActions.length);
    loadActiveAction();
  }, [roundActions]);

  if (!actorRound || !phase) {
    return <p>Loading character phase...</p>;
  }

  if (activeAction == null) {
    return <CombatActorRoundPhaseActionButtons actorRound={actorRound} game={game} character={character} phaseNumber={phase} />;
  }

  if (activeAction) {
    return <ResolveActionCard action={activeAction} character={actorRound} />;
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
