import React, { useEffect, useState } from "react";

import List from '@mui/material/List';

import { API_TACTICAL_URL } from "../../constants/environment";

import TacticalGameViewCharactersListItem from "./TacticalGameViewCharactersListItem";

const TacticalGameViewCharacters = ({ tacticalGame }) => {

    const debugMode = false;
    const [tacticalCharacters, setTacticalCharacters] = useState([]);

    const getTacticalCharacters = async () => {
        const url = `${API_TACTICAL_URL}/characters/tactical-games/${tacticalGame.id}`;
        try {
            const response = await fetch(url, { method: "GET", });
            const data = await response.json();
            setTacticalCharacters(data.content);
        } catch (error) {
            console.error("error loading characters :" + error);
        }
    };

    useEffect(() => {
        if (!tacticalGame) {

        } else {
            getTacticalCharacters();
        }
    }, []);

    return (
        <div>
            <h3>Characters</h3>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {tacticalCharacters.map((item) => (
                    <TacticalGameViewCharactersListItem character={item} tacticalGame={tacticalGame} />
                ))}
            </List>
            {debugMode ? (
                <div>
                    <pre>
                        {JSON.stringify(tacticalCharacters, null, 2)}
                    </pre>
                </div>
            ) : null}
        </div >
    );
};

export default TacticalGameViewCharacters;