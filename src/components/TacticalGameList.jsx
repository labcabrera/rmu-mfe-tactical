import React, { useEffect, useState } from "react";
import TacticalGameListItem from "./TacticalGameListItem";

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ImageIcon from '@mui/icons-material/Image';
import WorkIcon from '@mui/icons-material/Work';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';

const TacticalGameList = () => {
    const [games, setGames] = useState([]);

    const getGames = async () => {
        const response = await fetch("http://localhost:3001/v1/tactical-games", {
            method: "GET",
        });
        const data = await response.json();
        setGames(data);
    };

    useEffect(() => {
        getGames();
    }, []);


    return (
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            {games.map((item) => (
                <TacticalGameListItem key={item.id} game={item} />
            ))}
        </List>
    );
}

export default TacticalGameList;