import React, { useContext, useEffect } from 'react';
import CombatActorRoundList from './CombatActorRoundList';
import CombatDashboardActions from './CombatDashboardActions';
import { CombatContext } from './CombatProvider';

const CombatDashboardTabActions = () => {
  const { displayRound, setDisplayRound } = useContext(CombatContext);
  const { game, setGame } = useContext(CombatContext);
  const { characters, setCharacters } = useContext(CombatContext);
  const { characterRounds, setCharacterRounds } = useContext(CombatContext);
  const { roundActions, setRoundActions } = useContext(CombatContext);

  return (
    <>
      <CombatDashboardActions />
      <CombatActorRoundList />
    </>
  );
};

export default CombatDashboardTabActions;
