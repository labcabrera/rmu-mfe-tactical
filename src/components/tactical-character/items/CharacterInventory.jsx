import React from "react";
import { useTranslation } from 'react-i18next';

import { Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";

import ItemTypeAvatar from "../../avatar/ItemTypeAvatar";
import DeleteButton from "../../button/DeleteButton";
import TacticalCharacterAddItem from "./TacticalCharacterAddItem";

import { API_TACTICAL_URL } from "../../../constants/environment";
import { DETAIL_BUTTON_SIZE } from "../../../constants/ui";

const CharacterInventoryItemList = ({ item, character, setCharacter }) => {

    const { t } = useTranslation();

    const handleDeleteClick = async () => {
        const response = await fetch(`${API_TACTICAL_URL}/characters/${character.id}/items/${item.id}`, { method: 'DELETE' });
        if (response.status == 200) {
            const responseBody = await response.json();
            setCharacter(responseBody);
        }
    };

    return (
        <Grid container spacing={2} alignItems="center">
            <Grid size={2}>
                <Stack direction='row' alignItems="center">
                    <ItemTypeAvatar itemType={item.itemTypeId} size={60} variant='square' />
                    <Typography variant="subtitle2" sx={{ marginLeft: '10px' }}>{item.name}</Typography>
                </Stack>
            </Grid>
            <Grid size={2}>
            </Grid>
            <Grid size={2}>
            </Grid>
            <Grid size={2}>
            </Grid>
            <Grid size={2}>
                <Typography>{item.info?.weight}</Typography>
            </Grid>
            <Grid size={2}>
                <DeleteButton onClick={handleDeleteClick} size={DETAIL_BUTTON_SIZE} />
            </Grid>
        </Grid >
    );
}

const CharacterInventory = ({ game, character, setCharacter }) => {

    const { t } = useTranslation();

    return (
        <Box>
            <Typography variant="h6">{t('inventory')}</Typography>
            <TacticalCharacterAddItem game={game} character={character} setCharacter={setCharacter} />
            {character.items.map((item, index) => (
                <CharacterInventoryItemList key={index} item={item} character={character} setCharacter={setCharacter} />
            ))}
        </Box>
    );
}

export default CharacterInventory;