import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';

import { API_TACTICAL_URL } from "../constants/environment";

import witchKing from '../assets/witch-king.jpg';
import gondor from '../assets/human-gondor.jpg';

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

const TacticalGameViewCharactersListItem = ({ tacticalGame, character }) => {

    const navigate = useNavigate();

    const handleCharacterItemEditClick = () => {
        navigate(`/tactical/characters/edit/${character.id}`, { state: { tacticalGame: tacticalGame, tacticalCharacter: character } });
    };

    const handleCharacterItemDeleteClick = () => {
        console.log("handleCharacterItemDeleteClick " + character);
    }

    const resolveAvatarImage = () => {
        if (character.info.race === 'lotr-human') {
            return gondor;
        }
        return witchKing;
    };

    return (
        <ListItem secondaryAction={
            <Stack spacing={2} direction="row" sx={{
                justifyContent: "flex-end",
                alignItems: "flex-start",
            }}>
                <IconButton edge="end" aria-label="edit" onClick={handleCharacterItemEditClick}>
                    <EditIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={handleCharacterItemDeleteClick}>
                    <DeleteIcon />
                </IconButton>
            </Stack>
        }>
            <ListItemAvatar>
                <Avatar src={resolveAvatarImage()} />
            </ListItemAvatar>
            <ListItemText primary={character.name} secondary={`Level ${character.info.level} ${character.info.race}`} />
        </ListItem>
    );
}

export default TacticalGameViewCharacters;