import React, { createContext, useState } from 'react';

export const CombatContext = createContext();

export const CombatProvider = ({ children }) => {

    const [tacticalGame, setTacticalGame] = useState({});
    const [characters, setCharacters] = useState([]);
    const [characterRounds, setCharacterRounds] = useState([]);
    const [roundActions, setRoundActions] = useState([]);
    const [displayRound, setDisplayRound] = useState(13);

    return (
        <CombatContext.Provider value={{
            tacticalGame, setTacticalGame,
            characters, setCharacters,
            characterRounds, setCharacterRounds,
            roundActions, setRoundActions,
            displayRound, setDisplayRound
        }}>
            {children}
        </CombatContext.Provider>
    );
};