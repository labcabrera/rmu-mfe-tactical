import React, { useContext, useEffect } from "react";

import CombatCharacterList from "./CombatCharacterList";
import CombatDashboardActions from './CombatDashboardActions';
import { CombatContext } from './CombatProvider';

import { API_TACTICAL_URL } from "../../constants/environment";

const CombatDashboard = () => {

    const debugMode = true;

    const { gameId } = useContext(CombatContext);
    const { displayRound, setDisplayRound } = useContext(CombatContext);
    const { game, setGame } = useContext(CombatContext);
    const { characters, setCharacters } = useContext(CombatContext);
    const { characterRounds, setCharacterRounds } = useContext(CombatContext);
    const { roundActions, setRoundActions } = useContext(CombatContext);

    const fetchTacticalGame = async () => {
        console.info(`CombatDashboard.fetchTacticalGame ${gameId} triggered`);
        if (!gameId) {
            console.info(`CombatDashboard.fetchTacticalGame aborted`);
            return;
        }
        try {
            const response = await fetch(`${API_TACTICAL_URL}/tactical-games/${gameId}`, { method: 'GET' });
            const tacticalGameResponse = await response.json();
            setGame(tacticalGameResponse);
            setDisplayRound(tacticalGameResponse.round);
        } catch (error) {
            console.error("fetchTacticalGameAndStart error: " + error);
        }
    };

    const fetchCharacters = async () => {
        console.info(`CombatDashboard.fetchCharacters ${gameId} triggered`);
        if (!gameId) {
            console.info(`CombatDashboard.fetchCharacters aborted`);
            return;
        }
        const charactersResponse = await fetch(`${API_TACTICAL_URL}/characters?tacticalGameId=${gameId}&page=0&size=100`);
        const charactersResponseContent = await charactersResponse.json();
        setCharacters(charactersResponseContent.content);
    };

    const fecthCharacterRounds = async () => {
        console.info(`CombatDashboard.fecthCharacterRounds ${gameId} round ${displayRound}`);
        if (!gameId || !displayRound) {
            console.info("CombatDashboard.fecthCharacterRounds aborted");
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

    const fetchActions = async () => {
        console.info(`CombatDashboard.fetchActions ${gameId} round ${displayRound}`);
        if (!gameId || !displayRound) {
            console.info("CombatDashboard.fetchActions aborted");
            return;
        }
        try {
            const response = await fetch(`${API_TACTICAL_URL}/actions?tacticalGameId=${gameId}&round=${displayRound}`);
            const data = await response.json();
            setRoundActions(data.content);
        } catch (error) {
            console.error("CombatDashboard.fetchActions error: " + error);
        }
    };

    useEffect(() => {
        console.log("CombatDashboard.useEffect[tacticalGameId] triggered");
        fetchTacticalGame();
        fetchCharacters();
    }, [gameId]);

    useEffect(() => {
        console.log(`CombatDashboard.useEffect[displayRound] triggered ${displayRound}`);
        fecthCharacterRounds();
        fetchActions();
    }, [displayRound]);

    return (
        <>
            <CombatDashboardActions />
            <div className="combat-dashboard">
                <CombatCharacterList tacticalGame={game} characterRounds={characterRounds} />
                {debugMode ? (
                    <div>
                        <h3>tacticalGame</h3>
                        <pre>
                            {JSON.stringify(game, null, 2)}
                        </pre>
                        <h3>characters</h3>
                        <pre>
                            {JSON.stringify(characters, null, 2)}
                        </pre>
                        <h3>characterRounds</h3>
                        <pre>
                            {JSON.stringify(characterRounds, null, 2)}
                        </pre>
                        <h3>roundActions</h3>
                        <pre>
                            {JSON.stringify(roundActions, null, 2)}
                        </pre>
                    </div>
                ) : null}
            </div >
        </>
    );
}

export default CombatDashboard;
