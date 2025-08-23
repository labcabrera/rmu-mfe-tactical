import React, { useContext } from 'react';
import CombatActorRound from './CombatCharacterRound';
import { CombatContext } from './CombatProvider';

const CombatCharacterList = () => {
  const { actorRounds, setActorRounds } = useContext(CombatContext);

  if (!actorRounds) {
    return <p>Loading character list...</p>;
  }

  return (
    <>
      {actorRounds.map((item, index) => (
        <CombatActorRound key={index} actorRound={item} />
      ))}
    </>
  );
};

export default CombatCharacterList;
