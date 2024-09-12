import React, { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

const TacticalGameView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const game = location.state?.game;

    return (
        <div>
            <div>Tactical game view WIP</div>
            <div>Game: {game.name}</div>
        </div>
    );
}

export default TacticalGameView;