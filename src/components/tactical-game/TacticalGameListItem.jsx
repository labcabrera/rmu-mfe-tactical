import React from "react";
import { useNavigate } from "react-router-dom";

import Avatar from '@mui/material/Avatar';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

import witchKing from '../../assets/images/races/lotr-witch-king.jpg';

const TacticalGameListItem = ({ tacticalGame }) => {

    const navigate = useNavigate();

    const handleGameClick = () => {
        navigate(`view/${tacticalGame.id}`, { state: { tacticalGame: tacticalGame } });
    }

    return (
        <div>
            <ListItemButton onClick={handleGameClick}>
                <ListItemAvatar>
                    <Avatar src={witchKing}>
                    </Avatar>
                </ListItemAvatar>
                <ListItemText primary={tacticalGame.name} secondary={tacticalGame.user} />
            </ListItemButton>
        </div>
    );
}

export default TacticalGameListItem;