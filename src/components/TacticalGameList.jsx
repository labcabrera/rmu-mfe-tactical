import React, { useEffect, useState } from "react";
import TacticalGameListItem from "./TacticalGameListItem";

const TacticalGameList = () => {
    const [games, setGames] = useState([]);

    const getGames = async () => {
        const response = await fetch("http://localhost:3001/v1/tactical-games", {
            method: "GET",
        });
        const data = await response.json();
        console.log("data: " + data);
        setGames(data);

    };

    useEffect(() => {
        getGames();
    }, []);


    return (
        <div>
            <h1>Lista de partidas tácticas</h1>
            <div>
                {games.map((item) => (
                    <TacticalGameListItem key={item.id} game={item} />
                ))}
            </div>
        </div>
    );
}

export default TacticalGameList;