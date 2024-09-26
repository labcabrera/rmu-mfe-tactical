import React, { useContext, useEffect } from "react";

import CombatCharacterList from "./CombatCharacterList";
import CombatDashboardActions from './CombatDashboardActions';
import { CombatContext } from './CombatProvider';

import { API_TACTICAL_URL } from "../../constants/environment";

const CombatDashboard = () => {

    const debugMode = true;

    const { tacticalGameId, setTacticalGameId } = useContext(CombatContext);
    const { displayRound, setDisplayRound } = useContext(CombatContext);
    const { tacticalGame, setTacticalGame } = useContext(CombatContext);
    const { characters, setCharacters } = useContext(CombatContext);
    const { characterRounds, setCharacterRounds } = useContext(CombatContext);

    const fetchTacticalGame = async () => {
        console.info(`CombatDashboard.fetchTacticalGame ${tacticalGameId} triggered`);
        if (!tacticalGameId) {
            console.info(`CombatDashboard.fetchTacticalGame aborted`);
        }
        try {
            const response = await fetch(`${API_TACTICAL_URL}/tactical-games/${tacticalGameId}`, { method: 'GET' });
            const tacticalGameResponse = await response.json();
            setTacticalGame(tacticalGameResponse);
            setDisplayRound(tacticalGameResponse.round);
        } catch (error) {
            console.error("fetchTacticalGameAndStart error: " + error);
        }
    };

    const fetchCharacters = async () => {
        console.info(`CombatDashboard.fetchCharacters ${tacticalGameId} triggered`);
        if (!tacticalGameId) {
            console.info(`CombatDashboard.fetchCharacters aborted`);
            return;
        }
        const charactersResponse = await fetch(`${API_TACTICAL_URL}/characters?tacticalGameId=${tacticalGameId}&page=0&size=100`);
        const charactersResponseContent = await charactersResponse.json();
        setCharacters(charactersResponseContent.content);
    };

    const fecthCharacterRounds = async () => {
        console.info(`CombatDashboard.fecthCharacterRounds ${tacticalGameId} round ${displayRound}`);
        if (!tacticalGameId || !displayRound) {
            console.info("CombatDashboard.fecthCharacterRounds aborted");
            return;
        }
        try {
            const response = await fetch(`${API_TACTICAL_URL}/tactical-games/${tacticalGameId}/rounds/${displayRound}/characters`);
            const data = await response.json();
            setCharacterRounds(data);
        } catch (error) {
            console.error("CombatDashboard.fecthCharacterRounds error: " + error);
        }
    };

    useEffect(() => {
        console.log("CombatDashboard.useEffect[tacticalGameId] triggered");
        fetchTacticalGame();
        fetchCharacters();
    }, [tacticalGameId]);

    useEffect(() => {
        console.log(`CombatDashboard.useEffect[displayRound] triggered ${displayRound}`);
        fecthCharacterRounds();
    }, [displayRound]);


    return (
        <div className="combat-dashboard">
            <CombatDashboardActions />
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
