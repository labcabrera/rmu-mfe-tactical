import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';

import CombatDashboardActions from './CombatDashboardActions';

import { API_TACTICAL_URL } from "../../constants/environment";
import CombatCharacterList from "./CombatCharacterList";

const CombatDashboard = () => {

    const debugMode = true;

    const { gameId } = useParams();

    const [tacticalGame, setTacticalGame] = useState({});
    const [characters, setCharacters] = useState([]);
    const [characterRounds, setCharacterRounds] = useState([]);
    const [displayRound, setDisplayRound] = useState(1);

    const fetchTacticalGameAndStart = async () => {
        console.info("fetch tactical game");
        try {
            const response = await fetch(`${API_TACTICAL_URL}/tactical-games/${gameId}`, { method: 'GET' });
            var tacticalGameResponse = await response.json();
            if (tacticalGameResponse.status == 'created') {
                console.info("starting game");
                const started = await fetch(`${API_TACTICAL_URL}/tactical-games/${gameId}/rounds/start`, { method: 'POST' });
                tacticalGameResponse = await started.json();
            }
            setTacticalGame(tacticalGameResponse);
            setDisplayRound(tacticalGameResponse.round);

            const charactersResponse = await fetch(`${API_TACTICAL_URL}/characters?tacticalGameId=${gameId}&page=0&size=100`);
            const charactersResponseJson = await charactersResponse.json();
            setCharacters(charactersResponseJson.content);

            const round = tacticalGameResponse.round;
            console.log("fetching characters for round " + round);
            const characterRoundsResponse = await fetch(`${API_TACTICAL_URL}/tactical-games/${gameId}/rounds/${round}/characters`);
            const characterRoundsResponseJson = await characterRoundsResponse.json();
            setCharacterRounds(characterRoundsResponseJson);

        } catch (error) {
            console.error("fetch error: " + error);
        }
    };

    const onDisplayRoundChange = (newDisplayRound) => {
        console.log("onDisplayRoundChange: " + newDisplayRound);
        setDisplayRound(newDisplayRound);
    };

    const handleNewTurnClick = () => {

    };

    const fecthCharacterRounds = async (gameId, round) => {
        console.info("fetch character rounds");
        try {
            const response = await fetch(`${API_TACTICAL_URL}/tactical-games/${gameId}/rounds/${round}/characters`);
            const data = await response.json();
            setCharacters(data.content);
        } catch (error) {
            console.error("error loading characters :" + error);
        }
    }

    useEffect(() => {
        fetchTacticalGameAndStart();
    }, []);

    const startGame = () => {
    };

    return (
        <div className="combat-dashboard">
            <CombatDashboardActions displayRound={displayRound} setDisplayRound={setDisplayRound} />
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
