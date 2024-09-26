import React, { useContext, useEffect } from "react";
import { useParams } from 'react-router-dom';

import CombatCharacterList from "./CombatCharacterList";
import CombatDashboardActions from './CombatDashboardActions';

import { API_TACTICAL_URL } from "../../constants/environment";

import { CombatContext } from './CombatProvider';

const CombatDashboard = () => {

    const debugMode = true;

    const { gameId } = useParams();

    const { displayRound, setDisplayRound } = useContext(CombatContext);
    const { tacticalGame, setTacticalGame } = useContext(CombatContext);
    const { characters, setCharacters } = useContext(CombatContext);
    const { characterRounds, setCharacterRounds } = useContext(CombatContext);

    const fetchTacticalGameAndStart = async () => {
        console.info("fetchTacticalGameAndStart triggered");
        try {
            const response = await fetch(`${API_TACTICAL_URL}/tactical-games/${gameId}`, { method: 'GET' });
            const tacticalGameResponse = await response.json();
            setTacticalGame(tacticalGameResponse);
            setDisplayRound(tacticalGameResponse.round);
        } catch (error) {
            console.error("fetchTacticalGameAndStart error: " + error);
        }
    };

    const fetchCharacters = async () => {
        console.log("fetchCharacters");
        const charactersResponse = await fetch(`${API_TACTICAL_URL}/characters?tacticalGameId=${gameId}&page=0&size=100`);
        const charactersResponseJson = await charactersResponse.json();
        setCharacters(charactersResponseJson.content);
    };

    const fecthCharacterRounds = async () => {
        console.info(`fecthCharacterRounds ${gameId} round ${displayRound}`);
        if (!gameId || !displayRound) {
            return;
        }
        try {
            const response = await fetch(`${API_TACTICAL_URL}/tactical-games/${gameId}/rounds/${displayRound}/characters`);
            const data = await response.json();
            setCharacterRounds(data);
        } catch (error) {
            console.error("CombatDashboard.fecthCharacterRounds error: " + error);
        }
    };

    useEffect(() => {
        console.log("useEffect triggered");
        fetchTacticalGameAndStart();
        fetchCharacters();
    }, []);

    useEffect(() => {
        console.log(`useEffect displayRound triggered ${displayRound}`);
        fecthCharacterRounds();
    }, [displayRound]);


    return (
        <div className="combat-dashboard">
            <CombatDashboardActions />
            <div>
                WIP tactical game round {displayRound}
            </div>
            <CombatCharacterList tacticalGame={tacticalGame} characterRounds={characterRounds} />
            {debugMode ? (
                <div>
                    <h3>tacticalGame</h3>
                    <pre>
                        {JSON.stringify(tacticalGame, null, 2)}
                    </pre>
                    <h3>characters</h3>
                    <pre>
                        {JSON.stringify(characters, null, 2)}
                    </pre>
                    <h3>characterRounds</h3>
                    <pre>
                        {JSON.stringify(characterRounds, null, 2)}
                    </pre>
                </div>
            ) : null}
        </div >
    );
}

export default CombatDashboard;
