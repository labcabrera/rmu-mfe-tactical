import React, { useContext } from 'react';
import CombatActorRoundListItem from './CombatActorRoundListItem';
import { CombatContext } from './CombatProvider';

const CombatActorRoundList = () => {
  const { actorRounds } = useContext(CombatContext);

  if (!actorRounds || actorRounds.length === 0) {
    return <p>CombatActorRoundList: loading...</p>;
  }

  return (
    <>
      {actorRounds.map((item, index) => (
        <CombatActorRoundListItem key={index} actorRound={item} />
      ))}
    </>
  );
};

export default CombatActorRoundList;
