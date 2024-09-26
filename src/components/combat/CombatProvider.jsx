import React, { createContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export const CombatContext = createContext();

export const CombatProvider = ({ children }) => {

    const { gameId } = useParams();

    const [tacticalGameId, setTacticalGameId] = useState(null);
    const [tacticalGame, setTacticalGame] = useState(null);
    const [characters, setCharacters] = useState(null);
    const [characterRounds, setCharacterRounds] = useState(null);
    const [roundActions, setRoundActions] = useState(null);
    const [displayRound, setDisplayRound] = useState(null);

    useEffect(() => {
        console.log(`CombatProvider.useEffect[gameId] triggered ${gameId}`);
        setTacticalGameId(gameId);
    }, [gameId]);

    return (
        <CombatContext.Provider value={{
            tacticalGameId, setTacticalGameId,
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