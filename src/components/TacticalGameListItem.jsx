import React from "react";
import { useNavigate } from "react-router-dom";

const TacticalGameListItem = ({ game }) => {

    const navigate = useNavigate();

    return (
        <div className="tactical-game-list-view">
            <spam>{game.name}</spam>
            <spam>{game.user}</spam>
        </div >
    );
}

export default TacticalGameListItem;