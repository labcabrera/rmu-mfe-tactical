import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import { API_TACTICAL_URL } from "../../../constants/environment";
import TacticalGameEditActions from "./TacticalGameEditActions";

const TacticalGameEdit = ({ }) => {

    const debugMode = false;

    const location = useLocation();
    const { gameId } = useParams();

    const [tacticalGame, setTacticalGame] = useState();

    const fetchTacticalGame = async (tacticalGameId) => {
        const response = await fetch(`${API_TACTICAL_URL}/tactical-games/${tacticalGameId}`, { method: 'GET' });
        const responseBody = await response.json();
        setTacticalGame(responseBody);
    };

    useEffect(() => {
        if (location.state && location.state.tacticalGame) {
            console.log(`TacticalGameView.useEffect: resolved tacticalGame from state`);
            setTacticalGame(location.state.tacticalGame);
        } else {
            console.log(`TacticalGameView.useEffect: fetch tacticalGame ${gameId} from API`);
            fetchTacticalGame(gameId);
        }
    }, [location.state]);

    return (
        <>
            <TacticalGameEditActions tacticalGame={tacticalGame} />
            <div className="generic-main-content">
                wip game update
                {debugMode ? (
                    <pre>
                        {JSON.stringify(formData, null, 2)}
                    </pre>
                ) : null}
            </div>
        </>
    );
}

export default TacticalGameEdit;