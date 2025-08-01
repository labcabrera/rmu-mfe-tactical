import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Box from "@mui/material/Box";
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { API_TACTICAL_URL } from "../../../constants/environment";
import { DETAIL_BUTTON_SIZE } from "../../../constants/ui";

import ItemTypeAvatar from '../../avatar/ItemTypeAvatar';
import DeleteButton from '../../button/DeleteButton';
import ForgeButton from "../../button/ForgeButton";

const handleDeleteClick = async (character, item, setCharacter) => {
    const response = await fetch(`${API_TACTICAL_URL}/characters/${character.id}/items/${item.id}`, { method: 'DELETE' });
    if (response.status === 200) {
        const responseBody = await response.json();
        setCharacter(responseBody);
    }
};

const CharacterInventoryItem = ({ item, character, setCharacter }) => {
    const { itemTypeId, name, info } = item;

    return (
        <Grid container spacing={2} alignItems="center">
            <Grid item size={2}>
                <Stack direction='row' alignItems="center">
                    <ItemTypeAvatar itemType={itemTypeId} size={60} variant='square' />
                    <Typography variant="subtitle2" sx={{ marginLeft: '10px' }}>{name}</Typography>
                </Stack>
            </Grid>
            <Grid item size={6} />
            <Grid item size={2}>
                <Typography variant='subtitle2'>{info?.weight} lbs</Typography>
            </Grid>
            <Grid item size={2}>
                <DeleteButton onClick={() => handleDeleteClick(character, item, setCharacter)} size={DETAIL_BUTTON_SIZE} />
            </Grid>
        </Grid>
    );
};

const CharacterInventory = ({ game, character, setCharacter }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleForgeButtonClick = (e) => {
        navigate(`/tactical/forge/${game.id}`, { state: { game, character } });
    };

    return (
        <Box>
            <Typography variant="h6">{t('inventory')}</Typography>
            <ForgeButton onClick={handleForgeButtonClick} size={DETAIL_BUTTON_SIZE} />
            {character.items.map((item, index) => (
                <CharacterInventoryItem key={index} item={item} character={character} setCharacter={setCharacter} />
            ))}
        </Box>
    );
}

export default CharacterInventory;