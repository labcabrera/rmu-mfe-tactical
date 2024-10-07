import React from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";

import DeleteIcon from '@mui/icons-material/Delete';
import EditNoteIcon from '@mui/icons-material/EditNote';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';

import CharacterListItemAvatar from "../shared/CharacterIconItemAvatar";

import DeleteButton from "../button/DeleteButton";
import EditButton from "../button/EditButton";

import { API_TACTICAL_URL } from "../../constants/environment";

const TacticalGameViewCharactersListItem = ({ tacticalGame, character, onRemoveCharacter }) => {

    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const deleteTacticalCharacter = async () => {
        const response = await fetch(`${API_TACTICAL_URL}/characters/${character.id}`, { method: 'DELETE' });
        if (response.status === 204) {
            onRemoveCharacter(character.id);
        } else {
            //TODO display error
        }
    };

    const handleCharacterItemEditClick = () => {
        navigate(`/tactical/characters/edit/${character.id}`, { state: { tacticalGame: tacticalGame, tacticalCharacter: character } });
    };

    const handleCharacterItemDeleteClick = () => {
        deleteTacticalCharacter();
    };

    const getCharacterDetail = () => {
        return i18n(character.info.race);
    };

    if (!tacticalGame || !character) {
        return <p>Loading...</p>
    }

    return (
        <ListItem key={character.id} secondaryAction={
            <Stack spacing={1} direction="row" sx={{
                justifyContent: "flex-end",
                alignItems: "flex-start",
            }}>
                <EditButton onClick={handleCharacterItemEditClick} size={40} />
                <DeleteButton onClick={handleCharacterItemDeleteClick} size={40} />

                <IconButton edge="end" aria-label="edit" onClick={handleCharacterItemEditClick}>
                    <EditNoteIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={handleCharacterItemDeleteClick}>
                    <DeleteIcon />
                </IconButton>
            </Stack>
        }>
            <CharacterListItemAvatar character={character} />
            <ListItemText
                primary={character.name}
                secondary={`${t(character.info.race)} level ${character.info.level}`}
            />
        </ListItem>
    );
}

export default TacticalGameViewCharactersListItem;