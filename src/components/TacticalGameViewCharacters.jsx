import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

import { API_TACTICAL_URL } from "../constants/environment";

import witchKing from '../assets/witch-king.jpg';

const TacticalGameViewCharacters = ({ tacticalGame }) => {

    const debugMode = false;

    const navigate = useNavigate();

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
        getTacticalCharacters();
    }, []);


    return (
        <div>
            <h3>Characters</h3>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {tacticalCharacters.map((item) => (
                    <ListItemButton>
                        <ListItemAvatar>
                            <Avatar src={witchKing} />
                        </ListItemAvatar>
                        <ListItemText primary={item.name} secondary={`Level ${item.info.level} ${item.info.race}`} />
                    </ListItemButton>
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