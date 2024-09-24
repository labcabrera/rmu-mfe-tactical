import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { API_TACTICAL_URL } from "../../constants/environment";

const CombatDashboard = () => {

    const debugMode = true;

    const location = useLocation();
    const tacticalGame = location.state?.tacticalGame;

    const [characters, setCharacters] = useState({});

    useEffect(() => {
        const fetchCharacters = async () => {
            const url = `${API_TACTICAL_URL}/characters/tactical-games/${tacticalGame.id}`;
            try {
                const response = await fetch(url, { method: "GET", });
                const data = await response.json();
                setCharacters(data.content);
            } catch (error) {
                console.error("error loading characters :" + error);
            }
        };
        fetchCharacters();
    }, []);

    return (
        <div class="combat-dashboard">
            <div>
                WIP tactical game
            </div>

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
                </div>
            ) : null}
        </div >
    );
}

export default CombatDashboard;
