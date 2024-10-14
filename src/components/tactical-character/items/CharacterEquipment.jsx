import React from "react";

import Grid from '@mui/material/Grid2';

import CharacterInventory from "./CharacterInventory";
import CharacterItemSlot from "./CharacterItemSlot";

const CharacterEquipment = ({ game, character, setCharacter }) => {

    return (
        <>
            <Grid container spacing={2}>
                <Grid size={3}>
                    <CharacterItemSlot character={character} setCharacter={setCharacter} slot="mainHand" />
                </Grid>
                <Grid size={3}>
                    <CharacterItemSlot character={character} setCharacter={setCharacter} slot="offHand" />
                </Grid>
                <Grid size={3}>
                    <CharacterItemSlot character={character} setCharacter={setCharacter} slot="body" />
                </Grid>
            </Grid>
            <CharacterInventory game={game} character={character} setCharacter={setCharacter} />
        </>
    );
}

export default CharacterEquipment;