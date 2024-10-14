import React from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";

import { Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";

import ItemTypeAvatar from "../../avatar/ItemTypeAvatar";
import DeleteButton from "../../button/DeleteButton";
import ForgeButton from "../../button/ForgeButton";

import { API_TACTICAL_URL } from "../../../constants/environment";
import { DETAIL_BUTTON_SIZE } from "../../../constants/ui";

const CharacterInventoryItemList = ({ item, character, setCharacter }) => {

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
                <Typography>{item.info?.weight} lbs</Typography>
            </Grid>
            <Grid size={2}>
                <DeleteButton onClick={handleDeleteClick} size={DETAIL_BUTTON_SIZE} />
            </Grid>
        </Grid >
    );
}

const CharacterInventory = ({ game, character, setCharacter }) => {

    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleForgeButtonClick = (e) => {
        navigate(`/tactical/forge/${game.id}`, { state: { game: game, character: character } });
        return;
    };

    return (
        <Box>
            <Typography variant="h6">{t('inventory')}</Typography>
            <ForgeButton onClick={handleForgeButtonClick} size={DETAIL_BUTTON_SIZE} />
            {character.items.map((item, index) => (
                <CharacterInventoryItemList key={index} item={item} character={character} setCharacter={setCharacter} />
            ))}
        </Box>
    );
}

export default CharacterInventory;