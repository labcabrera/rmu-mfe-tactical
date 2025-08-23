import React, { createContext, useState } from 'react';
import { useParams } from 'react-router-dom';

export const CombatContext = createContext();

export const CombatProvider = ({ children }) => {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [characters, setCharacters] = useState(null);
  const [characterRounds, setCharacterRounds] = useState(null);
  const [roundActions, setRoundActions] = useState(null);
  const [displayRound, setDisplayRound] = useState(null);

  return (
    <CombatContext.Provider
      value={{
        gameId,
        game,
        setGame,
        characters,
        setCharacters,
        characterRounds,
        setCharacterRounds,
        roundActions,
        setRoundActions,
        displayRound,
        setDisplayRound,
      }}
    >
      {children}
    </CombatContext.Provider>
  );
};
