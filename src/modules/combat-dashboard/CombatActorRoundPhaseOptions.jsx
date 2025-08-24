import React, { useContext, useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import CombatActorRoundPhaseActionButtons from './CombatActorRoundPhaseActionButtons';
import { CombatContext } from './CombatProvider';
import ResolveActionCard from './ResolveActionCard';

const CombatActorRoundPhaseOptions = ({ actorRound, character, phase }) => {
  const [activeAction, setActiveAction] = useState(null);
  const { characters, setCharacters } = useContext(CombatContext);
  const { game, setGame } = useContext(CombatContext);
  const { roundActions, setRoundActions } = useContext(CombatContext);

  const loadActiveAction = () => {
    const characterActions = roundActions.filter((e) => e.characterId == actorRound.id);
    for (let action of characterActions) {
      const actionStart = action.phaseStart;
      const actionEnd = action.phaseStart + action.actionPoints - 1;
      if (phase >= actionStart && phase <= actionEnd) {
        setActiveAction(action);
        return;
      }
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

  if (activeAction.phaseStart + activeAction.actionPoints - 1 == phase) {
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
