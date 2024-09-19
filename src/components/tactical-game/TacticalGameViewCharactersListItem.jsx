import React from "react";
import { useNavigate } from "react-router-dom";

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import EditNoteIcon from '@mui/icons-material/EditNote';

import CharacterListItemAvatar from "../shared/CharacterIconItemAvatar";

const TacticalGameViewCharactersListItem = ({ tacticalGame, character }) => {

    const navigate = useNavigate();

    const handleCharacterItemEditClick = () => {
        navigate(`/tactical/characters/edit/${character.id}`, { state: { tacticalGame: tacticalGame, tacticalCharacter: character } });
    };

    const handleCharacterItemDeleteClick = () => {
        console.log("handleCharacterItemDeleteClick " + character);
    }

    return (
        <ListItem secondaryAction={
            <Stack spacing={1} direction="row" sx={{
                justifyContent: "flex-end",
                alignItems: "flex-start",
            }}>
                <IconButton edge="end" aria-label="edit" onClick={handleCharacterItemEditClick}>
                    <EditNoteIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={handleCharacterItemDeleteClick}>
                    <DeleteIcon />
                </IconButton>
            </Stack>
        }>
            <CharacterListItemAvatar character={character} />
            <ListItemText primary={character.name} secondary={`Level ${character.info.level} ${character.info.race}`} />
        </ListItem>
    );
}

export default TacticalGameViewCharactersListItem;